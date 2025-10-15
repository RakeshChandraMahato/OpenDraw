import { useState } from "react";
import { TabBar } from "./TabBar";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { Theme } from "@excalidraw/element/types";

interface TabbedAppProps {
  children: React.ReactNode;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  theme: Theme;
}

export const TabbedApp = ({ children, excalidrawAPI, theme }: TabbedAppProps) => {
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [isTabsOpen, setIsTabsOpen] = useState(false);

  // Convert theme to class name
  const themeClass = theme === "dark" ? "theme--dark" : "theme--light";

  const handleSaveCurrentTab = () => {
    if (!excalidrawAPI) return "";
    
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      
      return JSON.stringify({
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          currentItemFillStyle: appState.currentItemFillStyle,
          currentItemStrokeWidth: appState.currentItemStrokeWidth,
          currentItemStrokeStyle: appState.currentItemStrokeStyle,
          currentItemRoughness: appState.currentItemRoughness,
          currentItemOpacity: appState.currentItemOpacity,
          currentItemFontFamily: appState.currentItemFontFamily,
          currentItemFontSize: appState.currentItemFontSize,
          currentItemTextAlign: appState.currentItemTextAlign,
          currentItemStartArrowhead: appState.currentItemStartArrowhead,
          currentItemEndArrowhead: appState.currentItemEndArrowhead,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom,
          currentItemRoundness: appState.currentItemRoundness,
        },
        files,
      });
    } catch (error) {
      console.error("Failed to save tab data:", error);
      return "";
    }
  };

  const handleLoadTab = (sceneData: string | null) => {
    if (!excalidrawAPI) return;

    if (!sceneData) {
      // Load empty scene
      excalidrawAPI.updateScene({
        elements: [],
        appState: {},
      });
      excalidrawAPI.resetScene();
      return;
    }

    try {
      const data = JSON.parse(sceneData);
      excalidrawAPI.updateScene({
        elements: data.elements || [],
        appState: data.appState || {},
      });
      
      if (data.files) {
        excalidrawAPI.addFiles(Object.values(data.files));
      }
    } catch (error) {
      console.error("Failed to load tab data:", error);
      excalidrawAPI.resetScene();
    }
  };

  return (
    <div className={themeClass} style={{ height: "100%", display: "flex", flexDirection: "row" }}>
      <div style={{ 
        flex: 1, 
        overflow: "hidden", 
        marginRight: isTabsOpen ? "200px" : "0", 
        position: "relative",
        transition: "margin-right 0.3s ease"
      }}>
        {children}
      </div>
      <TabBar
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onSaveCurrentTab={handleSaveCurrentTab}
        onLoadTab={handleLoadTab}
        isOpen={isTabsOpen}
        onToggle={setIsTabsOpen}
      />
    </div>
  );
};
