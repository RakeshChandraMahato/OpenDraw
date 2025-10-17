import { Footer } from "@excalidraw/excalidraw/index";
import React, { useState } from "react";

import { isExcalidrawPlusSignedUser } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";
import { ExcalidrawPlusAppLink } from "./ExcalidrawPlusAppLink";
import { Calculator } from "./Calculator";

export const AppFooter = React.memo(
  ({ onChange }: { onChange: () => void }) => {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          {isExcalidrawPlusSignedUser ? (
            <ExcalidrawPlusAppLink />
          ) : (
            <EncryptedIcon />
          )}
          <button
            className="footer-calculator-button"
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            aria-label="Calculator"
            title="Calculator"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--icon-fill-color)",
            }}
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
        </div>
        {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
      </Footer>
    );
  },
);
