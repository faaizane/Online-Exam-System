import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable back button that navigates to the previous page (or to `to` prop if provided).
 * Usage: <BackButton />
 */
export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      className="mb-5 inline-flex w-fit items-center gap-1.5 text-sm px-3 py-1 border border-[#002855] text-[#002855] rounded-md shadow hover:bg-[#002855] hover:text-white transition-colors"
    >
      <span className="text-lg leading-none">←</span>
      {label}
    </button>
  );
} 