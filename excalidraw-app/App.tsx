import {
  Excalidraw,
  TTDDialogTrigger,
  CaptureUpdateAction,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
} from "@excalidraw/excalidraw";
import { trackEvent } from "@excalidraw/excalidraw/analytics";
import {
  CommandPalette,
  DEFAULT_CATEGORIES,
} from "@excalidraw/excalidraw/components/CommandPalette/CommandPalette";
import { ErrorDialog } from "@excalidraw/excalidraw/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirm";
import {
  EVENT,
  VERSION_TIMEOUT,
  debounce,
  getVersion,
  getFrame,
  isTestEnv,
  preventUnload,
  resolvablePromise,
  isDevEnv,
} from "@excalidraw/common";
import polyfill from "@excalidraw/excalidraw/polyfill";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@excalidraw/excalidraw/i18n";
import { isElementLink } from "@excalidraw/element";
import {
  restoreAppState,
  restoreElements,
} from "@excalidraw/excalidraw/data/restore";
import { newElementWith } from "@excalidraw/element";
import { isInitializedImageElement } from "@excalidraw/element";
import clsx from "clsx";
import {
  parseLibraryTokensFromUrl,
  useHandleLibrary,
} from "@excalidraw/excalidraw/data/library";

import type { RestoredDataState } from "@excalidraw/excalidraw/data/restore";
import type {
  FileId,
  NonDeletedExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import type { ResolvablePromise } from "@excalidraw/common/utils";

import CustomStats from "./CustomStats";
import { Provider, useAtomValue, appJotaiStore } from "./app-jotai";
import { STORAGE_KEYS, SYNC_BROWSER_TABS_TIMEOUT } from "./app_constants";
import { AppFooter } from "./components/AppFooter";
import { AppMainMenu } from "./components/AppMainMenu";
import { AppWelcomeScreen } from "./components/AppWelcomeScreen";
import { TopErrorBoundary } from "./components/TopErrorBoundary";

import { updateStaleImageStatuses } from "./data/FileManager";
import { FileStatusStore } from "./data/fileStatusStore";
import { importFromLocalStorage } from "./data/localStorage";

import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  LocalData,
  localStorageQuotaExceededAtom,
} from "./data/LocalData";
import { isBrowserStorageStateNewer } from "./data/tabSync";
import { useHandleAppTheme } from "./useHandleAppTheme";
import { getPreferredLanguage } from "./app-language/language-detector";
import { useAppLangCode } from "./app-language/language-state";
import DebugCanvas, {
  debugRenderer,
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "./components/DebugCanvas";
import { AIComponents } from "./components/AI";
import { AppSidebar } from "./components/AppSidebar";
import {
  initBoards,
  getBoardsList,
  setActiveBoardId,
  loadBoardData,
  saveBoardData,
  createBoard,
  deleteBoard,
  renameBoard,
} from "./data/boardsManager";

import { BookmarkTabs } from "./components/BookmarkTabs";

import "./index.scss";

import type { BoardMeta } from "./data/boardsManager";

polyfill();

window.EXCALIDRAW_THROTTLE_RENDER = true;

declare global {
  interface BeforeInstallPromptEventChoiceResult {
    outcome: "accepted" | "dismissed";
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<BeforeInstallPromptEventChoiceResult>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let pwaEvent: BeforeInstallPromptEvent | null = null;

// Adding a listener outside of the component as it may (?) need to be
// subscribed early to catch the event.
window.addEventListener(
  "beforeinstallprompt",
  (event: BeforeInstallPromptEvent) => {
    // prevent Chrome <= 67 from automatically showing the prompt
    event.preventDefault();
    // cache for later use
    pwaEvent = event;
  },
);

let isSelfEmbedding = false;

if (window.self !== window.top) {
  try {
    const parentUrl = new URL(document.referrer);
    const currentUrl = new URL(window.location.href);
    if (parentUrl.origin === currentUrl.origin) {
      isSelfEmbedding = true;
    }
  } catch (error) {
    // ignore
  }
}

const initializeScene = async (opts: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}): Promise<{
  scene: ExcalidrawInitialDataState | null;
  boards: BoardMeta[];
  activeBoardId: string;
}> => {
  const { boards, activeBoardId, initialData } = await initBoards();

  const scene: Omit<RestoredDataState, "files"> & {
    scrollToContent?: boolean;
  } = {
    elements: restoreElements(initialData?.elements, null, {
      repairBindings: true,
      deleteInvisibleElements: true,
    }),
    appState: restoreAppState(initialData?.appState, null),
  };

  return { scene, boards, activeBoardId };
};

const ExcalidrawWrapper = () => {
  const excalidrawAPI = useExcalidrawAPI();

  const [errorMessage, setErrorMessage] = useState("");

  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<string>("");
  const activeBoardIdRef = useRef<string>("");
  activeBoardIdRef.current = activeBoardId;

  const { editorTheme, appTheme, setAppTheme } = useHandleAppTheme();

  const [langCode, setLangCode] = useAppLangCode();

  // initial state
  // ---------------------------------------------------------------------------

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackEvent("load", "frame", getFrame());
    // Delayed so that the app has a time to load the latest SW
    setTimeout(() => {
      trackEvent("load", "version", getVersion());
    }, VERSION_TIMEOUT);
  }, []);

  useHandleLibrary({
    excalidrawAPI,
    adapter: LibraryIndexedDBAdapter,
    migrationAdapter: LibraryLocalStorageMigrationAdapter,
  });

  const [, forceRefresh] = useState(false);

  useEffect(() => {
    if (isDevEnv()) {
      const debugState = loadSavedDebugState();

      if (debugState.enabled && !window.visualDebug) {
        window.visualDebug = {
          data: [],
        };
      } else {
        delete window.visualDebug;
      }
      forceRefresh((prev) => !prev);
    }
  }, [excalidrawAPI]);

  // ---------------------------------------------------------------------------
  // Hoisted loadImages
  // ---------------------------------------------------------------------------
  const loadImages = useCallback(
    (
      data: { scene: ExcalidrawInitialDataState | null },
      isInitialLoad = false,
    ) => {
      if (!data.scene || !excalidrawAPI) {
        return;
      }

      const fileIds =
        data.scene.elements?.reduce((acc, element) => {
          if (isInitializedImageElement(element)) {
            return acc.concat(element.fileId);
          }
          return acc;
        }, [] as FileId[]) || [];

      if (isInitialLoad) {
        if (fileIds.length) {
          LocalData.fileStorage
            .getFiles(fileIds)
            .then(async ({ loadedFiles, erroredFiles }) => {
              if (loadedFiles.length) {
                excalidrawAPI.addFiles(loadedFiles);
              }
              updateStaleImageStatuses({
                excalidrawAPI,
                erroredFiles,
                elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
              });
            });
        }
        // on fresh load, clear unused files from IDB (from previous session)
        LocalData.fileStorage.clearObsoleteFiles({
          currentFileIds: fileIds,
        });
      }
    },
    [excalidrawAPI],
  );

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    initializeScene({ excalidrawAPI }).then(async (data) => {
      loadImages(data, /* isInitialLoad */ true);
      setBoards(data.boards);
      setActiveBoardIdState(data.activeBoardId);
      initialStatePromiseRef.current.promise.resolve(data.scene);
    });

    const onHashChange = async (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (!libraryUrlTokens) {
        excalidrawAPI.updateScene({ appState: { isLoading: true } });

        initializeScene({ excalidrawAPI }).then((data) => {
          loadImages(data);
          setBoards(data.boards);
          setActiveBoardIdState(data.activeBoardId);
          if (data.scene) {
            excalidrawAPI.updateScene({
              elements: restoreElements(data.scene.elements, null, {
                repairBindings: true,
              }),
              appState: restoreAppState(data.scene.appState, null),
              captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            });
          }
        });
      }
    };

    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (!document.hidden) {
        // don't sync if local state is newer or identical to browser state
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)) {
          const localDataState = importFromLocalStorage();
          setLangCode(getPreferredLanguage());
          excalidrawAPI.updateScene({
            ...localDataState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
          LibraryIndexedDBAdapter.load().then((data) => {
            if (data) {
              excalidrawAPI.updateLibrary({
                libraryItems: data.libraryItems,
              });
            }
          });
        }

        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = excalidrawAPI.getFiles();
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                // only load and update images that aren't already loaded
                !currFiles[element.fileId]
              ) {
                return acc.concat(element.fileId);
              }
              return acc;
            }, [] as FileId[]) || [];
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
        }
      }
    }, SYNC_BROWSER_TABS_TIMEOUT);

    const onUnload = () => {
      LocalData.flushSave();
    };

    const visibilityChange = (event: FocusEvent | Event) => {
      if (event.type === EVENT.BLUR || document.hidden) {
        LocalData.flushSave();
      }
      if (
        event.type === EVENT.VISIBILITY_CHANGE ||
        event.type === EVENT.FOCUS
      ) {
        syncData();
      }
    };

    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.UNLOAD, onUnload, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.UNLOAD, onUnload, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        visibilityChange,
        false,
      );
    };
  }, [excalidrawAPI, setLangCode, loadImages]);

  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      LocalData.flushSave();

      if (
        excalidrawAPI &&
        LocalData.fileStorage.shouldPreventUnload(
          excalidrawAPI.getSceneElements(),
        )
      ) {
        if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
          preventUnload(event);
        } else {
          console.warn(
            "preventing unload disabled (VITE_APP_DISABLE_PREVENT_UNLOAD)",
          );
        }
      }
    };
    window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    return () => {
      window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    };
  }, [excalidrawAPI]);

  const handleSelectBoard = useCallback(
    async (targetId: string) => {
      if (!excalidrawAPI || targetId === activeBoardIdRef.current) {
        return;
      }

      LocalData.flushSave();
      const currId = activeBoardIdRef.current;
      if (currId) {
        await saveBoardData(
          currId,
          excalidrawAPI.getSceneElements(),
          excalidrawAPI.getAppState(),
        );
      }

      const targetData = await loadBoardData(targetId);
      setActiveBoardId(targetId);
      setActiveBoardIdState(targetId);

      const targetScene = {
        elements: restoreElements(targetData?.elements || [], null, {
          repairBindings: true,
        }),
        appState: restoreAppState(targetData?.appState || null, null),
      };

      loadImages({ scene: targetScene });

      excalidrawAPI.updateScene({
        ...targetScene,
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      excalidrawAPI.history.clear();
    },
    [excalidrawAPI, loadImages],
  );

  const handleCreateBoard = useCallback(async () => {
    if (!excalidrawAPI) {
      return;
    }

    LocalData.flushSave();
    const currId = activeBoardIdRef.current;
    if (currId) {
      await saveBoardData(
        currId,
        excalidrawAPI.getSceneElements(),
        excalidrawAPI.getAppState(),
      );
    }

    const newBoard = await createBoard();
    setBoards(getBoardsList());
    setActiveBoardIdState(newBoard.id);

    excalidrawAPI.updateScene({
      elements: [],
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    excalidrawAPI.history.clear();
  }, [excalidrawAPI]);

  const handleDeleteBoard = useCallback(
    async (boardId: string) => {
      if (!excalidrawAPI) {
        return;
      }

      if (boards.length <= 1) {
        // Clear board if only 1 board exists
        excalidrawAPI.updateScene({
          elements: [],
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        });
        excalidrawAPI.history.clear();
        await saveBoardData(boardId, [], excalidrawAPI.getAppState());
        return;
      }

      const isActive = boardId === activeBoardIdRef.current;
      const { remainingBoards, nextActiveId } = await deleteBoard(boardId);
      setBoards(remainingBoards);

      if (isActive) {
        const targetData = await loadBoardData(nextActiveId);
        setActiveBoardIdState(nextActiveId);
        const targetScene = {
          elements: restoreElements(targetData?.elements || [], null, {
            repairBindings: true,
          }),
          appState: restoreAppState(targetData?.appState || null, null),
        };
        loadImages({ scene: targetScene });
        excalidrawAPI.updateScene({
          ...targetScene,
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        });
        excalidrawAPI.history.clear();
      }
    },
    [excalidrawAPI, boards.length, loadImages],
  );

  const handleRenameBoard = useCallback((boardId: string, newName: string) => {
    const updated = renameBoard(boardId, newName);
    setBoards(updated);
  }, []);

  const onChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // this check is redundant, but since this is a hot path, it's best
    // not to evaluate the nested expression every time
    if (!LocalData.isSavePaused()) {
      LocalData.save(elements, appState, files, () => {
        if (excalidrawAPI) {
          let didChange = false;

          const elements = excalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (
                LocalData.fileStorage.shouldUpdateImageElementStatus(element)
              ) {
                const newElement = newElementWith(element, { status: "saved" });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

          if (didChange) {
            excalidrawAPI.updateScene({
              elements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    // Render the debug scene if the debug canvas is available
    if (debugCanvasRef.current && excalidrawAPI) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }
  };

  const renderCustomStats = (
    elements: readonly NonDeletedExcalidrawElement[],
    appState: UIAppState,
  ) => {
    return (
      <CustomStats
        setToast={(message) => excalidrawAPI!.setToast({ message })}
        appState={appState}
        elements={elements}
      />
    );
  };

  const localStorageQuotaExceeded = useAtomValue(localStorageQuotaExceededAtom);

  // ---------------------------------------------------------------------------
  // onExport — intercepts file save to wait for pending image loads
  // ---------------------------------------------------------------------------
  const onExport: Required<ExcalidrawProps>["onExport"] = useCallback(
    async function* () {
      let snapshot = FileStatusStore.getSnapshot();
      const { pending, total } = FileStatusStore.getPendingCount(
        snapshot.value,
      );
      if (pending === 0) {
        return;
      }

      // Yield initial progress
      yield {
        type: "progress",
        progress: (total - pending) / total,
        message: `Loading images (${total - pending}/${total})...`,
      };

      // Wait for all pending images to finish
      while (true) {
        snapshot = await FileStatusStore.pull(snapshot.version);
        const { pending: nowPending, total: nowTotal } =
          FileStatusStore.getPendingCount(snapshot.value);

        yield {
          type: "progress",
          progress: (nowTotal - nowPending) / nowTotal,
          message: `Loading images (${nowTotal - nowPending}/${nowTotal})...`,
        };

        if (nowPending === 0) {
          await new Promise((r) => setTimeout(r, 500));
          yield {
            type: "progress",
            message: `Preparing export...`,
          };
          return;
        }
      }
    },
    [],
  );

  if (isSelfEmbedding) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <h1>I'm not a pretzel!</h1>
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }} className={clsx("excalidraw-app")}>
      <Excalidraw
        onChange={onChange}
        onExport={onExport}
        initialData={initialStatePromiseRef.current.promise}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
          },
        }}
        langCode={langCode}
        renderCustomStats={renderCustomStats}
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        theme={editorTheme}
        onThemeChange={setAppTheme}
        renderTopRightUI={() => null}
        onLinkOpen={(element, event) => {
          if (element.link && isElementLink(element.link)) {
            event.preventDefault();
            excalidrawAPI?.setViewport({
              target: element.link,
              fit: "scale-down",
              animation: true,
            });
          }
        }}
      >
        <AppMainMenu
          theme={appTheme}
          refresh={() => forceRefresh((prev) => !prev)}
        />
        <AppWelcomeScreen />
        <OverwriteConfirmDialog>
          <OverwriteConfirmDialog.Actions.ExportToImage />
          <OverwriteConfirmDialog.Actions.SaveToDisk />
        </OverwriteConfirmDialog>
        <AppFooter onChange={() => excalidrawAPI?.refresh()} />
        {excalidrawAPI && <AIComponents excalidrawAPI={excalidrawAPI} />}

        <TTDDialogTrigger />
        {localStorageQuotaExceeded && (
          <div className="alert alert--danger">
            {t("alerts.localStorageQuotaExceeded")}
          </div>
        )}

        <AppSidebar />

        {errorMessage && (
          <ErrorDialog onClose={() => setErrorMessage("")}>
            {errorMessage}
          </ErrorDialog>
        )}

        <CommandPalette
          customCommandPaletteItems={[
            {
              label: t("labels.installPWA"),
              category: DEFAULT_CATEGORIES.app,
              predicate: () => !!pwaEvent,
              perform: () => {
                if (pwaEvent) {
                  pwaEvent.prompt();
                  pwaEvent.userChoice.then(() => {
                    pwaEvent = null;
                  });
                }
              },
            },
          ]}
        />
        {isVisualDebuggerEnabled() && excalidrawAPI && (
          <DebugCanvas
            appState={excalidrawAPI.getAppState()}
            scale={window.devicePixelRatio}
            ref={debugCanvasRef}
          />
        )}
      </Excalidraw>
      {boards.length > 0 && (
        <BookmarkTabs
          boards={boards}
          activeBoardId={activeBoardId}
          theme={appTheme}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={handleRenameBoard}
        />
      )}
    </div>
  );
};

const ExcalidrawApp = () => {
  return (
    <TopErrorBoundary>
      <Provider store={appJotaiStore}>
        <ExcalidrawAPIProvider>
          <ExcalidrawWrapper />
        </ExcalidrawAPIProvider>
      </Provider>
    </TopErrorBoundary>
  );
};

export default ExcalidrawApp;
