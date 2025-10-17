import { useState, useEffect } from "react";
import "./TabBar.scss";

interface Tab {
  id: string;
  name: string;
  sceneData: string | null;
}

interface TabBarProps {
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onSaveCurrentTab: () => string; // Returns serialized scene data
  onLoadTab: (sceneData: string | null) => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export const TabBar = ({
  activeTabId,
  onTabChange,
  onSaveCurrentTab,
  onLoadTab,
  isOpen,
  onToggle,
}: TabBarProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Load tabs from localStorage on mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("opendraw-tabs");
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
      } catch (e) {
        console.error("Failed to parse tabs from localStorage", e);
        initializeDefaultTab();
      }
    } else {
      initializeDefaultTab();
    }
  }, []);

  const initializeDefaultTab = () => {
    const defaultTab: Tab = {
      id: "tab-1",
      name: "Board 1",
      sceneData: null,
    };
    setTabs([defaultTab]);
    localStorage.setItem("opendraw-tabs", JSON.stringify([defaultTab]));
  };

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem("opendraw-tabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  const handleCreateTab = () => {
    const newTabNumber = tabs.length + 1;
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: `Board ${newTabNumber}`,
      sceneData: null,
    };

    // Save current tab before switching
    const currentSceneData = onSaveCurrentTab();
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTabId ? { ...tab, sceneData: currentSceneData } : tab
    );

    setTabs([...updatedTabs, newTab]);
    onTabChange(newTab.id);
    onLoadTab(null); // Load empty scene
  };

  const handleSwitchTab = (tabId: string) => {
    if (tabId === activeTabId) return;

    // Save current tab
    const currentSceneData = onSaveCurrentTab();
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTabId ? { ...tab, sceneData: currentSceneData } : tab
    );
    setTabs(updatedTabs);

    // Load selected tab
    const selectedTab = updatedTabs.find((tab) => tab.id === tabId);
    if (selectedTab) {
      onTabChange(tabId);
      onLoadTab(selectedTab.sceneData);
    }
  };

  const handleRenameTab = (tabId: string, newName: string) => {
    setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab)));
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (tabs.length === 1) {
      // Don't close the last tab, just clear it
      onLoadTab(null);
      setTabs([{ ...tabs[0], sceneData: null }]);
      return;
    }

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If closing active tab, switch to adjacent tab
    if (tabId === activeTabId) {
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      onTabChange(newActiveTab.id);
      onLoadTab(newActiveTab.sceneData);
    }
  };

  return (
    <>
      <div className={`tab-bar-container ${isOpen ? "open" : "closed"}`}>
        <button
          className="tab-toggle-button"
          onClick={() => onToggle(!isOpen)}
          aria-label={isOpen ? "Close tabs" : "Open tabs"}
          title={isOpen ? "Close tabs" : "Open tabs"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            {isOpen ? (
              <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
        <div className="tab-bar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? "active" : ""}`}
              onClick={() => handleSwitchTab(tab.id)}
              onDoubleClick={() => {
                setRenamingTabId(tab.id);
                setRenameValue(tab.name);
              }}
            >
              {renamingTabId === tab.id ? (
                <input
                  type="text"
                  className="tab-name-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    handleRenameTab(tab.id, renameValue);
                    setRenamingTabId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameTab(tab.id, renameValue);
                      setRenamingTabId(null);
                    } else if (e.key === "Escape") {
                      setRenamingTabId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className="tab-name-display">
                  {tab.name}
                </span>
              )}
              <button
                className="close-tab-button"
                onClick={(e) => handleCloseTab(tab.id, e)}
                aria-label={`Close ${tab.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          className="create-tab-button"
          onClick={handleCreateTab}
          aria-label="Create new board"
        >
          +
        </button>
      </div>
    </>
  );
};
