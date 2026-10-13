import React, { useState } from "react";
import {
  X,
  Timer,
  Fire,
  ShoppingCart,
  CookingPot,
  CheckCircle,
  Sparkle,
  LightbulbFilament,
  ShareNetwork,
} from "@phosphor-icons/react";

export function RecipeDetailModal({
  recipe,
  onClose,
  onPickAsTodayRecommendation,
  onAddToShoppingList,
  onOpenRecordEditor,
}) {
  const [addedToast, setAddedToast] = useState("");

  if (!recipe) return null;

  function handleAddIngredientsToCart() {
    onAddToShoppingList(recipe);
    setAddedToast("已将本菜所有食材加入买菜清单！🛒");
    setTimeout(() => setAddedToast(""), 2200);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet recipe-detail-sheet">
        <div className="detail-hero-wrapper">
          <img src={recipe.image} alt={recipe.name} className="detail-hero-img" />
          <button
            className="icon-button detail-close-floating"
            type="button"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
          <div className="detail-hero-meta">
            <span className="detail-cat-badge">{recipe.category || "家常菜"}</span>
            {recipe.heat && <span className="detail-heat-badge">{recipe.heat}</span>}
          </div>
        </div>

        <div className="detail-content-scroll">
          <div className="detail-title-section">
            <h2 className="detail-dish-title">{recipe.name}</h2>
            <p className="detail-dish-tagline">{recipe.tagline || recipe.note}</p>
            <div className="detail-quick-tags">
              <span className="tag-chip">
                <Timer size={15} />
                {recipe.time || "20分钟"}
              </span>
              <span className="tag-chip">
                <Sparkle size={15} />
                {recipe.difficulty || "入门 ⭐⭐"}
              </span>
            </div>
          </div>

          {/* Ingredients Section */}
          <section className="detail-ingredients-section">
            <div className="detail-sec-header">
              <h3>
                <span>🥬</span> 用料食材清单
              </h3>
              <button
                type="button"
                className="mini-action-pill"
                onClick={handleAddIngredientsToCart}
              >
                <ShoppingCart size={15} />
                加到买菜清单
              </button>
            </div>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <div className="detail-ingredients-grid">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="ingredient-item-chip">
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-amount">{ing.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="detail-empty-hint">本菜谱暂未录入详细克重，可根据喜好酌量搭配。</p>
            )}
          </section>

          {/* Steps Section */}
          <section className="detail-steps-section">
            <div className="detail-sec-header">
              <h3>
                <span>🍳</span> 详细烹饪步骤
              </h3>
            </div>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className="detail-steps-list">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="detail-step-item">
                    <span className="step-number-badge">{idx + 1}</span>
                    <p className="step-text">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="detail-fallback-steps">
                <p>1. 准备好新鲜食材与调料，洗净切块备用。</p>
                <p>2. 热油爆香葱姜蒜，下入主料翻炒至变色熟透。</p>
                <p>3. 调味收汁，出锅装盘趁热享用。</p>
              </div>
            )}
          </section>

          {/* Chef Tips */}
          {recipe.tips && (
            <div className="detail-chef-tips-card">
              <div className="chef-tips-title">
                <LightbulbFilament size={18} weight="fill" className="lightbulb-icon" />
                <strong>大厨私房秘籍</strong>
              </div>
              <p>{recipe.tips}</p>
            </div>
          )}

          {addedToast && <div className="detail-toast">{addedToast}</div>}
        </div>

        {/* Bottom Action Buttons */}
        <div className="detail-bottom-bar">
          <button
            className="outline-action"
            type="button"
            onClick={() => {
              if (onOpenRecordEditor) {
                onClose();
                onOpenRecordEditor({ defaultRecipe: recipe });
              }
            }}
          >
            <CookingPot size={18} />
            打卡今天做了
          </button>
          <button
            className="primary-action filled-warm"
            type="button"
            onClick={() => {
              if (onPickAsTodayRecommendation) {
                onPickAsTodayRecommendation(recipe.id);
                onClose();
              }
            }}
          >
            <CheckCircle size={18} />
            定为今日吃它
          </button>
        </div>
      </section>
    </div>
  );
}
