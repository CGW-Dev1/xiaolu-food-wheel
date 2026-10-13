import React from "react";
import { CaretUp, BowlFood } from "@phosphor-icons/react";

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

export function RouletteWheel({
  recipes,
  selectedRecipe,
  selectedIndex,
  spinning,
  pointerRotation,
  onSelect,
  onSpin,
}) {
  const count = Math.max(recipes.length, 1);
  const slice = 360 / count;
  const selectedCenter = selectedIndex * slice;
  const separator = Math.min(1.0, slice * 0.05);

  // Elegant porcelain & jade pastel sector gradient
  const wheelGradient = `conic-gradient(from ${-slice / 2}deg, ${recipes
    .map((recipe, index) => {
      const start = index * slice;
      const end = start + slice;
      // Alternate between soft cream parchment and subtle celadon/warm ivory
      const segColor =
        index % 2 === 0
          ? "#f8f4e6"
          : "#ede7d3";
      return [
        `rgba(178, 160, 132, 0.45) ${start}deg ${start + separator}deg`,
        `${segColor} ${start + separator}deg ${end - separator}deg`,
        `rgba(178, 160, 132, 0.45) ${end - separator}deg ${end}deg`,
      ].join(", ");
    })
    .join(", ")})`;

  const selectedGradient = `conic-gradient(from ${
    selectedCenter - slice / 2
  }deg, rgba(235, 120, 85, 0.22) 0deg ${slice}deg, transparent ${slice}deg 360deg)`;

  return (
    <div className="wheel-stage" aria-live="polite">
      {/* Decorative porcelain rim container */}
      <div className="wheel-porcelain-frame">
        <div
          className="roulette"
          data-pointer-angle={normalizeAngle(pointerRotation).toFixed(3)}
          data-selected-index={selectedIndex}
          data-selected-name={selectedRecipe?.name ?? ""}
          data-slice-size={slice.toFixed(3)}
          style={{
            background: wheelGradient,
          }}
        >
          {/* Subtle sector highlight for currently active/selected recipe */}
          <div
            className={`selected-sector ${spinning ? "is-waiting" : ""}`}
            style={{
              background: selectedGradient,
            }}
          />

          {/* Golden concentric rings on the plate */}
          <div className="wheel-concentric-ring ring-outer" />
          <div className="wheel-concentric-ring ring-inner" />

          {/* Pointer indicator */}
          <div
            className={`wheel-arrow ${spinning ? "is-spinning" : ""}`}
            style={{ "--pointer-rotation": `${pointerRotation}deg` }}
          >
            <div className="vintage-pointer-needle">
              <div className="pointer-gem" />
            </div>
          </div>

          {/* Dishes arranged in a circle */}
          <div className="wheel-inner">
            {recipes.map((recipe, index) => {
              const angle = index * slice;
              const isSelected = index === selectedIndex && !spinning;
              return (
                <button
                  className={`wheel-item ${isSelected ? "is-active" : ""}`}
                  style={{
                    "--item-angle": `${angle}deg`,
                    "--reverse-angle": `${-angle}deg`,
                  }}
                  key={recipe.id}
                  type="button"
                  onClick={() => onSelect(recipe.id)}
                  aria-label={recipe.name}
                >
                  <div className="wheel-item-plate">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} className="wheel-dish-img" />
                    ) : (
                      <div className="wheel-dish-placeholder">
                        <BowlFood size={18} />
                      </div>
                    )}
                  </div>
                  <span className="wheel-item-label">{recipe.name}</span>
                </button>
              );
            })}

            {/* Central Terracotta / ZhuSha Ceramic Button */}
            <button
              className="spin-button terracotta-button"
              type="button"
              onClick={onSpin}
              disabled={spinning}
              aria-label="开始抽签"
            >
              <div className="spin-button-inner">
                <span className="spin-btn-main">{spinning ? "摇签中" : "开始"}</span>
                <span className="spin-btn-sub">{spinning ? "..." : "抽签"}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
