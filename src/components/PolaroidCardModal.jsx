import React, { useState } from "react";
import { X, Star, Copy, ShareNetwork, Sparkle } from "@phosphor-icons/react";

export function PolaroidCardModal({
  record,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  async function handleCopyShare() {
    const stars = "⭐".repeat(record.rating || 5);
    const text = `🍽️【小璐今天吃什么 · 美食打卡】\n菜名：${record.name}\n日期：${record.date} (${record.weekday || ""})\n评价：${stars}\n心得：${record.note || "大获好评，干饭超香！"}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  }

  const rating = record.rating || 5;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet polaroid-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">生活仪式感 · 拍立得手账</p>
            <h2>美食记录明信片</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        {/* Polaroid Card Frame */}
        <div className="polaroid-outer-wrapper">
          <div className="polaroid-washi-tape" />

          <div className="polaroid-card">
            {/* Photo frame */}
            <div className="polaroid-photo-frame">
              {record.image ? (
                <img src={record.image} alt={record.name} className="polaroid-photo" />
              ) : (
                <div className="polaroid-empty-photo">
                  <span>🍲 {record.name}</span>
                </div>
              )}
            </div>

            {/* Bottom Caption Area */}
            <div className="polaroid-caption-area">
              <div className="polaroid-header-row">
                <span className="polaroid-dish-title">{record.name}</span>
                <span className="polaroid-date-stamp">{record.date}</span>
              </div>

              {/* Stars */}
              <div className="polaroid-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    weight={star <= rating ? "fill" : "regular"}
                    className={star <= rating ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>

              {/* Note / Review */}
              <p className="polaroid-review-text">
                “{record.note || "今天又是认真吃饭的一天，香气扑鼻，干饭超香！"}”
              </p>

              {/* Red Seal */}
              <div className="polaroid-footer-row">
                <span className="polaroid-mood-tag">#小璐私房美味</span>
                <div className="polaroid-seal">小璐手作</div>
              </div>
            </div>
          </div>
        </div>

        {copied && <div className="detail-toast">已复制分享文案到剪贴板！✨</div>}

        {/* Actions */}
        <div className="polaroid-bottom-actions">
          <button className="primary-action filled-warm" type="button" onClick={handleCopyShare}>
            <ShareNetwork size={18} />
            复制美食日记分享
          </button>
        </div>
      </section>
    </div>
  );
}
