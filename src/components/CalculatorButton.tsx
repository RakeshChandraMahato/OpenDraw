import { useState } from "react";
import { Calculator } from "./Calculator";
import "./CalculatorButton.scss";

export const CalculatorButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="calculator-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Calculator"
        title="Calculator"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="2" width="14" height="16" rx="2" />
          <line x1="7" y1="6" x2="13" y2="6" />
          <line x1="7" y1="10" x2="7" y2="10" />
          <line x1="10" y1="10" x2="10" y2="10" />
          <line x1="13" y1="10" x2="13" y2="10" />
          <line x1="7" y1="14" x2="7" y2="14" />
          <line x1="10" y1="14" x2="10" y2="14" />
          <line x1="13" y1="14" x2="13" y2="14" />
        </svg>
      </button>
      {isOpen && <Calculator onClose={() => setIsOpen(false)} />}
    </>
  );
};
