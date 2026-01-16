import { useEffect } from "react";
import { X } from "lucide-react";
import "./popup.css";

// Reusable Popup Component
function Popup({ isOpen, onClose, title, children, onViewed }) {
  // 🔹 Notify parent when popup becomes visible
  useEffect(() => {
    if (isOpen && onViewed) {
      onViewed();
    }
  }, [isOpen, onViewed]);

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-container">
        <button className="popup-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="popup-content">
          {title && <h2 className="popup-title">{title}</h2>}
          {children}
        </div>
      </div>
    </>
  );
}

export default Popup;
