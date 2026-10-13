import React, { useState, useMemo } from "react";
import { X, ArrowClockwise, ShoppingCart, Sparkle, BowlFood, Check, ForkKnife } from "@phosphor-icons/react";

const COMBO_PRESETS = [
  {
    id: "classic",
    title: "一荤一素一汤",
    desc: "家常黄金组合，营养均衡不油腻",
    slots: [
      { type: "meat", label: "硬菜/荤菜", fallbackCat: "下饭菜" },
      { type: "veg", label: "清爽素菜", fallbackCat: "素菜" },
      { type: "soup", label: "营养靓汤", fallbackCat: "靓汤" },
    ],
  },
  {
    id: "couple",
    title: "双人丰盛餐",
    desc: "两荤一素，周末犒赏大快朵颐",
    slots: [
      { type: "meat", label: "大硬菜", fallbackCat: "硬菜" },
      { type: "meat", label: "下饭荤菜", fallbackCat: "家常菜" },
      { type: "veg", label: "时令蔬菜", fallbackCat: "素菜" },
    ],
  },
  {
    id: "quick",
    title: "快手独享餐",
    desc: "15分钟搞定，省心美味一锅端",
    slots: [
      { type: "staple", label: "主食面点", fallbackCat: "面食" },
      { type: "veg", label: "快手搭配", fallbackCat: "快手菜" },
    ],
  },
  {
    id: "light",
    title: "低卡轻食风",
    desc: "高蛋白搭配丰富纤维，无负担",
    slots: [
      { type: "veg", label: "低卡蔬菜", fallbackCat: "素菜" },
      { type: "meat", label: "优质肉禽", fallbackCat: "家常菜" },
      { type: "soup", label: "润燥汤品", fallbackCat: "靓汤" },
    ],
  },
];

export function MealComboModal({
  recipes,
  onClose,
  onSelectRecipe,
  onAddToShoppingList,
  onViewRecipeDetail,
}) {
  const [activePresetId, setActivePresetId] = useState("classic");
  const currentPreset = COMBO_PRESETS.find((p) => p.id === activePresetId) || COMBO_PRESETS[0];

  // Helper to pick a recipe by slot type
  function pickRecipeForSlot(slot, excludeIds = []) {
    let pool = recipes.filter(
      (r) =>
        !excludeIds.includes(r.id) &&
        (r.type === slot.type || r.category?.includes(slot.fallbackCat)),
    );
    if (!pool.length) {
      pool = recipes.filter((r) => !excludeIds.includes(r.id));
    }
    if (!pool.length) pool = recipes;
    return pool[Math.floor(Math.random() * pool.length)] || recipes[0];
  }

  // State to hold the picked recipes for the current preset's slots
  const [comboSelection, setComboSelection] = useState(() => {
    const picked = [];
    const usedIds = [];
    currentPreset.slots.forEach((slot) => {
      const r = pickRecipeForSlot(slot, usedIds);
      if (r) {
        usedIds.push(r.id);
        picked.push(r);
      }
    });
    return picked;
  });

  // Switch preset
  function handlePresetChange(presetId) {
    setActivePresetId(presetId);
    const preset = COMBO_PRESETS.find((p) => p.id === presetId) || COMBO_PRESETS[0];
    const picked = [];
    const usedIds = [];
    preset.slots.forEach((slot) => {
      const r = pickRecipeForSlot(slot, usedIds);
      if (r) {
        usedIds.push(r.id);
        picked.push(r);
      }
    });
    setComboSelection(picked);
  }

  // Re-roll entire combo
  function handleRerollAll() {
    const picked = [];
    const usedIds = [];
    currentPreset.slots.forEach((slot) => {
      const r = pickRecipeForSlot(slot, usedIds);
      if (r) {
        usedIds.push(r.id);
        picked.push(r);
      }
    });
    setComboSelection(picked);
  }

  // Re-roll a single slot
  function handleRerollSlot(index) {
    const slot = currentPreset.slots[index];
    const currentRecipe = comboSelection[index];
    const usedIds = comboSelection.map((r) => r.id);
    const replacement = pickRecipeForSlot(slot, usedIds.concat(currentRecipe?.id || []));
    if (replacement) {
      setComboSelection((prev) => {
        const next = [...prev];
        next[index] = replacement;
        return next;
      });
    }
  }

  // Add all ingredients of this combo to shopping list
  const [addedNotice, setAddedNotice] = useState("");
  function handleAddAllToCart() {
    comboSelection.forEach((recipe) => {
      if (recipe) onAddToShoppingList(recipe);
    });
    setAddedNotice("已将整桌食材加入买菜清单！🛒");
    setTimeout(() => setAddedNotice(""), 2500);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet combo-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">智能搭配 · 帮我配一餐</p>
            <h2>解决今天一整桌难题</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        {/* Preset switcher tabs */}
        <div className="combo-presets-tabs">
          {COMBO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`combo-tab ${activePresetId === preset.id ? "is-active" : ""}`}
              onClick={() => handlePresetChange(preset.id)}
              type="button"
            >
              <span>{preset.title}</span>
            </button>
          ))}
        </div>

        <p className="combo-preset-desc">{currentPreset.desc}</p>

        {/* Selected Dishes Cards in Combo */}
        <div className="combo-cards-list">
          {currentPreset.slots.map((slot, idx) => {
            const recipe = comboSelection[idx];
            if (!recipe) return null;
            return (
              <div key={idx} className="combo-dish-card">
                <div className="combo-slot-badge">{slot.label}</div>
                <div
                  className="combo-dish-media"
                  onClick={() => onViewRecipeDetail && onViewRecipeDetail(recipe)}
                  title="点击查看详细做法"
                >
                  <img src={recipe.image} alt={recipe.name} />
                </div>
                <div className="combo-dish-info">
                  <div className="combo-dish-header">
                    <strong
                      className="combo-dish-title"
                      onClick={() => onViewRecipeDetail && onViewRecipeDetail(recipe)}
                    >
                      {recipe.name}
                    </strong>
                    <span className="combo-dish-time">{recipe.time || "15分钟"}</span>
                  </div>
                  <p className="combo-dish-note">{recipe.tagline || recipe.note}</p>
                </div>
                <div className="combo-dish-actions">
                  <button
                    className="icon-pill mini"
                    type="button"
                    onClick={() => handleRerollSlot(idx)}
                    title="单独换一道"
                  >
                    <ArrowClockwise size={16} />
                    <span>换一道</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {addedNotice && <div className="combo-toast">{addedNotice}</div>}

        {/* Bottom actions */}
        <div className="combo-bottom-bar">
          <button className="outline-action" type="button" onClick={handleRerollAll}>
            <Sparkle size={18} />
            换整桌搭配
          </button>
          <button className="primary-action filled-warm" type="button" onClick={handleAddAllToCart}>
            <ShoppingCart size={18} />
            加入买菜清单
          </button>
        </div>
      </section>
    </div>
  );
}
