import React, { useEffect, useCallback } from "react";

/**
 * VehicleDemoModal
 * Props:
 *  - demo: { title: string, image: string } | null
 *  - onClose: () => void
 */
export default function VehicleDemoModal({ demo, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!demo) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [demo, handleKeyDown]);

  if (!demo) return null;

  return (
    <>
      {/* ── Keyframe definitions ─────────────────────────────── */}
      <style>{`
        @keyframes vdm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vdm-modal-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .vdm-close:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
      `}</style>

      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${demo.title} demo image`}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "12px",
          animation: "vdm-backdrop-in 0.18s ease forwards",
          boxSizing: "border-box",
        }}
      >
        {/* ── Modal panel ────────────────────────────────────── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)",
            /* 95vw on mobile, capped at 520px on desktop */
            width: "min(520px, 95vw)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",           /* clip image corners */
            animation: "vdm-modal-in 0.24s cubic-bezier(0.34,1.4,0.64,1) forwards",
            boxSizing: "border-box",
          }}
        >
          {/* ── Header ───────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 16px 16px 20px",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(15px, 4vw, 18px)",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              {demo.title}
            </h2>

            {/* Close button — minimum 44×44px tap target */}
            <button
              className="vdm-close"
              onClick={onClose}
              aria-label="Close demo modal"
              style={{
                minWidth: "44px",
                minHeight: "44px",
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                background: "transparent",
                color: "#64748b",
                fontSize: "24px",
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* ── Thin divider ─────────────────────────────────── */}
          <div style={{ height: "1px", background: "#f1f5f9", flexShrink: 0 }} />

          {/* ── Image — zero padding, full width, scrollable ─── */}
          <div
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
              /* Zero padding / margin so image touches the edges */
              padding: 0,
              margin: 0,
              /* Flex center in case image is narrow */
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,             /* allow flex shrink */
              background: "#000",       /* letterbox colour */
            }}
          >
            <img
              src={demo.image}
              alt={`${demo.title} demo`}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                /* clamp: at least 200px, grow to fill, cap at 60vh */
                maxHeight: "60vh",
                objectFit: "contain",
                objectPosition: "center center",
                margin: 0,
                padding: 0,
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const msg = document.createElement("p");
                msg.style.cssText =
                  "color:#94a3b8;text-align:center;padding:40px 20px;font-size:13px;line-height:1.6;";
                msg.innerHTML =
                  "Image not found.<br/>Place the file in<br/><code>public/images/vehicle-demo/</code>";
                e.currentTarget.parentElement.appendChild(msg);
              }}
            />
          </div>

          {/* ── Footer caption ───────────────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              borderTop: "1px solid #f1f5f9",
              padding: "10px 20px 14px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              Representative image of the <strong style={{ color: "#64748b" }}>{demo.title}</strong> category
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
