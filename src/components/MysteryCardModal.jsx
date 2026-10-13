import React, { useState } from "react";
import { X, Sparkle, ArrowClockwise, CheckCircle, CookingPot, Fire } from "@phosphor-icons/react";

const CARD_THEMES = [
  { label: "天选吉签", sub: "万事顺意", motif: "福" },
  { label: "灵犀巧签", sub: "大快朵颐", motif: "膳" },
  { label: "开怀上签", sub: "美味治愈", motif: "味" },
];

export function MysteryCardModal({
  recipes,
  onClose,
  onPickRecipe,
  onViewRecipeDetail,
}) {
  const [cards, setCards] = useState(() => {
    // Pick 3 random distinct recipes
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return CARD_THEMES.map((theme, i) => ({
      ...theme,
      recipe: shuffled[i] || recipes[0],
      isRevealed: false,
    }));
  });

  const [selectedCardIdx, setSelectedCardIdx] = useState(null);

  function revealCard(index) {
    if (cards[index].isRevealed) return;
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isRevealed: true } : c)),
    );
    setSelectedCardIdx(index);
  }

  function handleResetCards() {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    setCards(
      CARD_THEMES.map((theme, i) => ({
        ...theme,
        recipe: shuffled[i] || recipes[0],
        isRevealed: false,
      })),
    );
    setSelectedCardIdx(null);
  }

  const activeRevealed = selectedCardIdx !== null ? cards[selectedCardIdx] : null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet mystery-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">今日天选 · 盲盒抽签</p>
            <h2>闭上眼睛，翻开你的今日美食签</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        <p className="mystery-hint">
          {activeRevealed ? "🎉 恭喜翻出今日天选菜品！" : "点击其中一张卡片，揭晓小璐的神秘推荐："}
        </p>

        {/* 3 Mystery Cards Container */}
        <div className="mystery-cards-row">
          {cards.map((card, idx) => {
            const isPicked = selectedCardIdx === idx;
            return (
              <div
                key={idx}
                className={`mystery-flip-card ${card.isRevealed ? "is-flipped" : ""} ${
                  isPicked ? "is-active-picked" : ""
                }`}
                onClick={() => revealCard(idx)}
              >
                <div className="mystery-flip-inner">
                  {/* Card Back (Unrevealed) */}
                  <div className="mystery-card-back">
                    <div className="mystery-card-border">
                      <div className="mystery-seal-char">{card.motif}</div>
                      <span className="mystery-card-label">{card.label}</span>
                      <small className="mystery-card-sub">{card.sub}</small>
                      <div className="mystery-card-click-tip">点击揭晓</div>
                    </div>
                  </div>

                  {/* Card Front (Revealed) */}
                  <div className="mystery-card-front">
                    <div className="mystery-front-badge">{card.label}</div>
                    <div className="mystery-dish-thumb">
                      <img src={card.recipe.image} alt={card.recipe.name} />
                    </div>
                    <strong className="mystery-dish-name">{card.recipe.name}</strong>
                    <span className="mystery-dish-cat">{card.recipe.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revealed details view */}
        {activeRevealed && (
          <div className="mystery-result-box">
            <div className="mystery-fortune-quote">
              <Sparkle size={18} className="gold-icon" />
              <span>{activeRevealed.recipe.fortune || activeRevealed.recipe.tagline}</span>
            </div>

            <div className="mystery-result-actions">
              <button
                className="outline-action"
                type="button"
                onClick={() => onViewRecipeDetail(activeRevealed.recipe)}
              >
                <CookingPot size={18} />
                查看做法
              </button>
              <button
                className="primary-action filled-warm"
                type="button"
                onClick={() => {
                  onPickRecipe(activeRevealed.recipe.id);
                  onClose();
                }}
              >
                <CheckCircle size={18} />
                就吃它了！
              </button>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mystery-bottom-bar">
          <button className="link-button quiet" type="button" onClick={handleResetCards}>
            <ArrowClockwise size={16} />
            重新洗牌
          </button>
        </div>
      </section>
    </div>
  );
}
