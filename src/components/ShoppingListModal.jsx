import React, { useState } from "react";
import {
  X,
  Plus,
  Trash,
  Check,
  CheckSquare,
  Square,
  Copy,
  ShoppingCart,
  Sparkle,
} from "@phosphor-icons/react";

export function ShoppingListModal({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearItems,
  onClose,
}) {
  const [customText, setCustomText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const totalCount = items.length;
  const completedCount = items.filter((item) => item.checked).length;

  // Group items by category
  const categories = ["蔬菜", "肉类", "调料", "豆品", "蛋类", "主食", "其他"];
  const grouped = categories.map((cat) => ({
    name: cat,
    items: items.filter((item) => (item.category || "其他") === cat),
  })).filter((group) => group.items.length > 0);

  // Remaining unclassified
  const categorizedItemIds = new Set(grouped.flatMap((g) => g.items.map((i) => i.id)));
  const unclassified = items.filter((item) => !categorizedItemIds.has(item.id));
  if (unclassified.length > 0) {
    grouped.push({ name: "更多食材", items: unclassified });
  }

  function handleAddCustom(e) {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddItem({
      name: customText.trim(),
      amount: "1份",
      category: "其他",
      fromRecipe: "手动添加",
    });
    setCustomText("");
  }

  async function handleCopyList() {
    if (!items.length) return;
    let text = `🛒【小璐今天买菜清单】(${completedCount}/${totalCount})\n`;
    grouped.forEach((group) => {
      text += `\n📌 ${group.name}：\n`;
      group.items.forEach((item) => {
        const stateMark = item.checked ? " [x] " : " [ ] ";
        text += `${stateMark}${item.name} (${item.amount || "适量"})\n`;
      });
    });

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopyStatus("已复制到剪贴板，可发到微信！📋");
      } else {
        // fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopyStatus("已复制到剪贴板！📋");
      }
    } catch {
      setCopyStatus("复制失败，请手动截图或选取文字");
    }
    setTimeout(() => setCopyStatus(""), 2600);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet shopping-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">菜篮子 · 买菜清单</p>
            <h2>
              待买食材{" "}
              <span className="shopping-progress">
                ({completedCount}/{totalCount})
              </span>
            </h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        {/* Quick Add Custom Item */}
        <form className="shopping-quick-add" onSubmit={handleAddCustom}>
          <input
            type="text"
            placeholder="还要买点啥？例如：生姜50g、可乐1罐..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <button type="submit" className="mini-submit-btn" disabled={!customText.trim()}>
            <Plus size={18} />
            <span>添加</span>
          </button>
        </form>

        {/* List Content */}
        <div className="shopping-list-scroll">
          {items.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} className="empty-icon" />
              <strong>买菜清单还是空的</strong>
              <span>在推荐卡片或菜谱详情中，点击「加入买菜清单」自动汇总食材。</span>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.name} className="shopping-group">
                <div className="shopping-group-title">
                  <span>{group.name}</span>
                  <small>{group.items.length} 样</small>
                </div>
                <div className="shopping-items-grid">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className={`shopping-item-row ${item.checked ? "is-checked" : ""}`}
                      onClick={() => onToggleItem(item.id)}
                    >
                      <button type="button" className="shopping-check-box" aria-label="勾选">
                        {item.checked ? (
                          <CheckSquare size={20} weight="fill" className="check-icon-active" />
                        ) : (
                          <Square size={20} className="check-icon-empty" />
                        )}
                      </button>
                      <div className="shopping-item-texts">
                        <span className="shopping-item-name">{item.name}</span>
                        <small className="shopping-item-amt">{item.amount}</small>
                      </div>
                      {item.fromRecipe && (
                        <span className="shopping-from-tag">{item.fromRecipe}</span>
                      )}
                      <button
                        type="button"
                        className="shopping-item-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        aria-label="删除"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {copyStatus && <div className="shopping-copy-toast">{copyStatus}</div>}

        {/* Bottom actions */}
        {items.length > 0 && (
          <div className="shopping-bottom-bar">
            <button className="link-button quiet-danger" type="button" onClick={onClearItems}>
              <Trash size={16} />
              清空清单
            </button>
            <button className="primary-action filled-warm" type="button" onClick={handleCopyList}>
              <Copy size={18} />
              复制清单发微信
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
