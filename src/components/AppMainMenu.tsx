import { eyeIcon, ExportIcon } from "@excalidraw/excalidraw/components/icons";
import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import { isDevEnv } from "@excalidraw/common";
import { useExcalidrawActionManager } from "@excalidraw/excalidraw/components/App";
import { actionSaveFileToDisk, actionLoadScene } from "@excalidraw/excalidraw/actions";

import type { Theme } from "@excalidraw/element/types";

import { LanguageList } from "../app-language/LanguageList";

import { saveDebugState } from "./DebugCanvas";

const FolderOpenIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 19V6a1 1 0 0 1 1-1h4.032a1 1 0 0 1 .768.36l1.9 2.28a1 1 0 0 0 .768.36H16a1 1 0 0 1 1 1v1M3 19l3-8h15l-3 8H3Z" />
  </svg>
);

const RefreshIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
  </svg>
);

export const AppMainMenu: React.FC<{
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
  onRustExport?: () => void;
}> = React.memo((props) => {
  const actionManager = useExcalidrawActionManager();
  
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.Item
        icon={FolderOpenIcon}
        onSelect={() => actionManager.executeAction(actionLoadScene)}
      >
        Open file...
      </MainMenu.Item>
      <MainMenu.Item
        icon={ExportIcon}
        onSelect={() => actionManager.executeAction(actionSaveFileToDisk)}
      >
        Save to...
      </MainMenu.Item>
      <MainMenu.DefaultItems.SaveAsImage />
      {props.onRustExport && (
        <MainMenu.Item
          onClick={props.onRustExport}
        >
          ⚡ Rust Export (Fast)
        </MainMenu.Item>
      )}
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.Item
        icon={RefreshIcon}
        onSelect={() => window.location.reload()}
      >
        Refresh
      </MainMenu.Item>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Socials />
      {isDevEnv() && (
        <MainMenu.Item
          icon={eyeIcon}
          onClick={() => {
            if (window.visualDebug) {
              delete window.visualDebug;
              saveDebugState({ enabled: false });
            } else {
              window.visualDebug = { data: [] };
              saveDebugState({ enabled: true });
            }
            props?.refresh();
          }}
        >
          Visual Debug
        </MainMenu.Item>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme
        allowSystemTheme
        theme={props.theme}
        onSelect={props.setTheme}
      />
      <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom>
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
