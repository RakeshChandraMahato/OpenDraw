import { useState } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { t } from "@excalidraw/excalidraw/i18n";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";
import { exportToSvgRust, exportToPngRust, calculateBounds } from "../utils/rustBackend";

interface RustExportDialogProps {
  elements: readonly NonDeletedExcalidrawElement[];
  appState: Partial<AppState>;
  onClose: () => void;
}

export const RustExportDialog: React.FC<RustExportDialogProps> = ({
  elements,
  appState,
  onClose,
}) => {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleExportSVG = async () => {
    setExporting(true);
    setStatus("Calculating bounds with Rust...");
    
    try {
      const bounds = await calculateBounds(elements);
      if (!bounds) {
        setStatus("Failed to calculate bounds");
        return;
      }

      setStatus("Exporting to SVG with Rust...");
      const svg = await exportToSvgRust(elements, bounds);
      
      if (svg) {
        // Download SVG
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opendraw-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        
        setStatus("✅ SVG exported successfully using Rust!");
        setTimeout(onClose, 1500);
      } else {
        setStatus("❌ Rust export failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Export error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPNG = async () => {
    setExporting(true);
    setStatus("Calculating bounds with Rust...");
    
    try {
      const bounds = await calculateBounds(elements);
      if (!bounds) {
        setStatus("Failed to calculate bounds");
        return;
      }

      setStatus("Exporting to PNG with Rust...");
      const base64Image = await exportToPngRust(elements, bounds, 2);
      
      if (base64Image) {
        // Download PNG
        const a = document.createElement('a');
        a.href = base64Image;
        a.download = `opendraw-${Date.now()}.png`;
        a.click();
        
        setStatus("✅ PNG exported successfully using Rust!");
        setTimeout(onClose, 1500);
      } else {
        setStatus("❌ Rust export failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Export error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog onCloseRequest={onClose} title="⚡ Rust-Powered Export" size="small">
      <div style={{ padding: "20px" }}>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Export your drawing using high-performance Rust backend
        </p>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={handleExportSVG}
            disabled={exporting}
            style={{
              flex: 1,
              padding: "12px",
              background: "#ff6b00",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: exporting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {exporting ? "Exporting..." : "Export SVG"}
          </button>
          
          <button
            onClick={handleExportPNG}
            disabled={exporting}
            style={{
              flex: 1,
              padding: "12px",
              background: "#ff6b00",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: exporting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {exporting ? "Exporting..." : "Export PNG"}
          </button>
        </div>
        
        {status && (
          <div
            style={{
              padding: "10px",
              background: status.includes("✅") ? "#e8f5e9" : status.includes("❌") ? "#ffebee" : "#f5f5f5",
              borderRadius: "4px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {status}
          </div>
        )}
        
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#999", textAlign: "center" }}>
          <strong>Elements:</strong> {elements.length} | <strong>Backend:</strong> Rust ⚡
        </div>
      </div>
    </Dialog>
  );
};
