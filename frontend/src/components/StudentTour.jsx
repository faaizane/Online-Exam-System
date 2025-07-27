// src/components/StudentTour.js
import React from "react";

const StudentTour = ({ message, targetRef, visible, onClose, showButton = false }) => {
  if (!visible || !targetRef?.current) return null;

  const rect = targetRef.current.getBoundingClientRect();

  // Center the tooltip horizontally relative to target element
  const style = {
    position: "absolute",
    top: rect.top + window.scrollY + rect.height + 3, // a bit more offset for arrow
    left: rect.left + window.scrollX + rect.width * -0.19, // shift ~40% of target width
    zIndex: 9999,
    padding: "12px 16px",
    background: "#fffbea", // light yellow background for highlight
    border: "2px solid #ffd54f", // bold yellow border
    borderRadius: "10px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
    maxWidth: "260px",
    fontSize: "14px",
    lineHeight: 1.35,
    cursor: "pointer",
    transition: "opacity 0.3s ease, transform 0.3s ease"
  };

  return (
    <div
      style={style}
      onClick={!showButton ? onClose : undefined}
    >
      {/* Arrow pointer */}
      <div
        style={{
          position: "absolute",
          top: "-8px",
          left: "20%", // align arrow closer to left after shift
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: "8px solid #ffd54f"
        }}
      />

      <div className="text-gray-900 font-medium">{message}</div>
      {showButton && (
        <button
          className="mt-3 bg-[#ffd54f] text-[#002855] px-3 py-1 rounded-md text-xs font-semibold shadow hover:bg-[#ffec85] transition-colors"
          onClick={onClose}
        >
          Got it
        </button>
      )}
    </div>
  );
};

export default StudentTour;
