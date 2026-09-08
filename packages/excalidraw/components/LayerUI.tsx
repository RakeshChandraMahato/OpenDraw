import clsx from "clsx";
import React from "react";

import {
  CLASSES,
  DEFAULT_SIDEBAR,
  arrayToMap,
  capitalizeString,
  isShallowEqual,
} from "@excalidraw/common";

import { mutateElement } from "@excalidraw/element";

import { showSelectedShapeActions } from "@excalidraw/element";

import { ShapeCache } from "@excalidraw/element";

import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import { actionShortcuts, actionToggleStats } from "../actions";
import { trackEvent } from "../analytics";
import { TunnelsContext, useInitializeTunnels } from "../context/tunnels";
import { UIAppStateContext } from "../context/ui-appState";
import { useAtom, useAtomValue } from "../editor-jotai";

import { t } from "../i18n";
import { getScrollToContentState } from "../scene";

import {
  SelectedShapeActions,
  CompactShapeActions,
  ExitZenModeButton,
  UndoRedoActions,
  ZoomActions,
} from "./Actions";
import { HelpButton } from "./HelpButton";
import { LoadingMessage } from "./LoadingMessage";
import { MobileMenu } from "./MobileMenu";
import { PasteChartDialog } from "./PasteChartDialog";
import { Section } from "./Section";
import { PenModeButton } from "./PenModeButton";
import { isSidebarDockedAtom } from "./Sidebar/Sidebar";
import MainMenu from "./main-menu/MainMenu";
import { ActiveConfirmDialog } from "./ActiveConfirmDialog";
import { useAppProps, useEditorInterface, useStylesPanelMode } from "./App";
import { OverwriteConfirmDialog } from "./OverwriteConfirm/OverwriteConfirm";
import { sidebarRightIcon } from "./icons";
import { DefaultSidebar } from "./DefaultSidebar";
import { TTDDialog } from "./TTDDialog/TTDDialog";
import { Stats } from "./Stats";
import ElementLinkDialog from "./ElementLinkDialog";
import { ErrorDialog } from "./ErrorDialog";
import { EyeDropper, activeEyeDropperAtom } from "./EyeDropper";
import { HelpDialog } from "./HelpDialog";
import { ImageExportDialog } from "./ImageExportDialog";
import { Island } from "./Island";
import { JSONExportDialog } from "./JSONExportDialog";
import { Toast } from "./Toast";
import { Toolbar } from "./Toolbar";
import {
  ViewportStatusBadge,
  ViewportStatusBorder,
} from "./ViewportStatusFrame/ViewportStatusFrame";

import "./LayerUI.scss";
import "./Toolbar.scss";

import type { ActionManager } from "../actions/manager";

import type { Language } from "../i18n";
import type {
  AppProps,
  AppState,
  ExcalidrawProps,
  BinaryFiles,
  UIAppState,
  AppClassProperties,
} from "../types";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: UIAppState;
  files: BinaryFiles;
  canvas: HTMLCanvasElement;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onLockToggle: () => void;
  onPenModeToggle: AppClassProperties["togglePenMode"];
  showExitZenModeBtn: boolean;
  langCode: Language["code"];
  renderTopLeftUI?: ExcalidrawProps["renderTopLeftUI"];
  renderTopRightUI?: ExcalidrawProps["renderTopRightUI"];
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  UIOptions: AppProps["UIOptions"];
  onExportImage: AppClassProperties["onExportImage"];
  renderWelcomeScreen: boolean;
  children?: React.ReactNode;
  app: AppClassProperties;
  defaultUIEnabled: boolean;
  zoomUIEnabled: boolean;
  scrollBackToContentUIEnabled: boolean;
  isCollaborating: boolean;
  generateLinkForSelection?: AppProps["generateLinkForSelection"];
  currentUserControls?: ExcalidrawProps["currentUserControls"];
}

const DefaultMainMenu: React.FC<{
  UIOptions: AppProps["UIOptions"];
}> = ({ UIOptions }) => {
  return (
    <MainMenu __fallback>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      {/* FIXME we should to test for this inside the item itself */}
      {UIOptions.canvasActions.export && <MainMenu.DefaultItems.Export />}
      {/* FIXME we should to test for this inside the item itself */}
      {UIOptions.canvasActions.saveAsImage && (
        <MainMenu.DefaultItems.SaveAsImage />
      )}
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme allowSystemTheme={false} />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
};

const DefaultOverwriteConfirmDialog = () => {
  return (
    <OverwriteConfirmDialog __fallback>
      <OverwriteConfirmDialog.Actions.SaveToDisk />
      <OverwriteConfirmDialog.Actions.ExportToImage />
    </OverwriteConfirmDialog>
  );
};

const LayerUI = ({
  actionManager,
  appState,
  files,
  setAppState,
  elements,
  canvas,
  onLockToggle,
  onPenModeToggle,
  showExitZenModeBtn,
  renderTopLeftUI,
  renderTopRightUI,
  renderCustomStats,
  UIOptions,
  onExportImage,
  renderWelcomeScreen,
  children,
  app,
  defaultUIEnabled,
  zoomUIEnabled,
  scrollBackToContentUIEnabled,
  isCollaborating,
  generateLinkForSelection,
  currentUserControls,
}: LayerUIProps) => {
  const editorInterface = useEditorInterface();
  const appProps = useAppProps();
  const stylesPanelMode = useStylesPanelMode();
  const isCompactStylesPanel = stylesPanelMode === "compact";
  const tunnels = useInitializeTunnels();

  const TunnelsJotaiProvider = tunnels.tunnelsJotai.Provider;

  const [eyeDropperState, setEyeDropperState] = useAtom(activeEyeDropperAtom);

  const renderJSONExportDialog = () => {
    if (!UIOptions.canvasActions.export) {
      return null;
    }

    return (
      <JSONExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        exportOpts={UIOptions.canvasActions.export}
        canvas={canvas}
        setAppState={setAppState}
      />
    );
  };

  const renderImageExportDialog = () => {
    if (
      !UIOptions.canvasActions.saveAsImage ||
      appState.openDialog?.name !== "imageExport"
    ) {
      return null;
    }

    return (
      <ImageExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        onExportImage={onExportImage}
        onCloseRequest={() => setAppState({ openDialog: null })}
        name={app.getName()}
      />
    );
  };

  const renderCanvasActions = () => (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      <div
        className="excalidraw-ui-top-left"
        style={{ display: "flex", alignItems: "center" }}
      >
        {renderTopLeftUI?.(false, appState)}
        <tunnels.MainMenuTunnel.Out />
      </div>
      {renderWelcomeScreen && <tunnels.WelcomeScreenMenuHintTunnel.Out />}
    </div>
  );

  const renderSelectedShapeActions = () => {
    return (
      <Section
        heading="selectedShapeActions"
        className={clsx("selected-shape-actions zen-mode-transition", {
          "transition-left": appState.zenModeEnabled,
        })}
      >
        {isCompactStylesPanel ? (
          <Island
            className={clsx("compact-shape-actions-island")}
            padding={0}
            data-viewport-ui="side"
            data-viewport-ui-name="stylesPanel"
            style={{
              maxHeight: `${Math.max(120, appState.height - 90)}px`,
            }}
          >
            <CompactShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
              setAppState={setAppState}
            />
          </Island>
        ) : (
          <Island
            className={CLASSES.SHAPE_ACTIONS_MENU}
            padding={2}
            style={{
              maxHeight: `${Math.max(120, appState.height - 90)}px`,
            }}
            data-viewport-ui="side"
            data-viewport-ui-name="stylesPanel"
          >
            <SelectedShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
            />
          </Island>
        )}
      </Section>
    );
  };

  const shouldRenderSelectedShapeActions =
    defaultUIEnabled && showSelectedShapeActions(appState, elements);

  const shouldShowStats =
    defaultUIEnabled &&
    appState.stats.open &&
    !appState.zenModeEnabled &&
    !appState.viewModeEnabled &&
    appState.openDialog?.name !== "elementLinkSelector";

  const renderSidebars = () => {
    if (!defaultUIEnabled) {
      return null;
    }

    return (
      <DefaultSidebar
        __fallback
        onDock={(docked) => {
          trackEvent(
            "sidebar",
            `toggleDock (${docked ? "dock" : "undock"})`,
            `(${
              editorInterface.formFactor === "phone" ? "mobile" : "desktop"
            })`,
          );
        }}
      />
    );
  };

  const isSidebarDocked = useAtomValue(isSidebarDockedAtom);
  const isSidebarDockedAndFits = !!(
    appState.openSidebar &&
    isSidebarDocked &&
    editorInterface.canFitSidebar
  );

  const layerUIJSX = (
    <>
      {/* ------------------------- tunneled UI ---------------------------- */}
      {/* make sure we render host app components first so that we can detect
          them first on initial render to optimize layout shift */}
      {children}
      {/* Fallback entry points are the default UI. Host components above keep
          rendering into the outlets below even when defaults are disabled. */}
      {defaultUIEnabled && (
        <>
          <DefaultMainMenu UIOptions={UIOptions} />
          <DefaultSidebar.Trigger
            __fallback
            icon={sidebarRightIcon}
            title={capitalizeString(t("toolBar.library"))}
            onToggle={(open) => {
              if (open) {
                trackEvent(
                  "sidebar",
                  `${DEFAULT_SIDEBAR.name} (open)`,
                  `button (${
                    editorInterface.formFactor === "phone"
                      ? "mobile"
                      : "desktop"
                  })`,
                );
              }
            }}
            tab={DEFAULT_SIDEBAR.defaultTab}
          />
        </>
      )}
      {/* Keep supporting surfaces available to host-supplied UI, including
          MainMenu.DefaultItems. */}
      <DefaultOverwriteConfirmDialog />
      {appState.openDialog?.name === "ttd" && <TTDDialog __fallback />}
      {/* ------------------------------------------------------------------ */}

      {defaultUIEnabled && appState.isLoading && <LoadingMessage delay={250} />}
      {defaultUIEnabled && appState.errorMessage && (
        <ErrorDialog onClose={() => setAppState({ errorMessage: null })}>
          {appState.errorMessage}
        </ErrorDialog>
      )}
      {defaultUIEnabled &&
        eyeDropperState &&
        editorInterface.formFactor !== "phone" && (
          <EyeDropper
            colorPickerType={eyeDropperState.colorPickerType}
            onCancel={() => {
              setEyeDropperState(null);
            }}
            onChange={(
              colorPickerType,
              color,
              selectedElements,
              { altKey },
            ) => {
              if (
                colorPickerType !== "elementBackground" &&
                colorPickerType !== "elementStroke"
              ) {
                return;
              }

              if (selectedElements.length) {
                for (const element of selectedElements) {
                  mutateElement(element, arrayToMap(elements), {
                    [altKey && eyeDropperState.swapPreviewOnAlt
                      ? colorPickerType === "elementBackground"
                        ? "strokeColor"
                        : "backgroundColor"
                      : colorPickerType === "elementBackground"
                      ? "backgroundColor"
                      : "strokeColor"]: color,
                  });
                  ShapeCache.delete(element);
                }
                app.scene.triggerUpdate();
              } else if (colorPickerType === "elementBackground") {
                setAppState({
                  currentItemBackgroundColor: color,
                });
              } else {
                setAppState({ currentItemStrokeColor: color });
              }
            }}
            onSelect={(color, event) => {
              setEyeDropperState((state) => {
                return state?.keepOpenOnAlt && event.altKey ? state : null;
              });
              eyeDropperState?.onSelect?.(color, event);
            }}
          />
        )}
      {appState.openDialog?.name === "help" && (
        <HelpDialog
          onClose={() => {
            setAppState({ openDialog: null });
          }}
        />
      )}
      <ActiveConfirmDialog />
      {defaultUIEnabled && appState.openDialog?.name === "elementLinkSelector" && (
        <ElementLinkDialog
          sourceElementId={appState.openDialog.sourceElementId}
          onClose={() => {
            setAppState({
              openDialog: null,
            });
          }}
          scene={app.scene}
          appState={appState}
          generateLinkForSelection={generateLinkForSelection}
        />
      )}
      <tunnels.OverwriteConfirmDialogTunnel.Out />
      {renderImageExportDialog()}
      {renderJSONExportDialog()}
      {defaultUIEnabled && appState.openDialog?.name === "charts" && (
        <PasteChartDialog
          data={appState.openDialog.data}
          rawText={appState.openDialog.rawText}
          onClose={() =>
            setAppState({
              openDialog: null,
            })
          }
        />
      )}
      {editorInterface.formFactor === "phone" && (
        <MobileMenu
          app={app}
          appState={appState}
          elements={elements}
          actionManager={actionManager}
          renderJSONExportDialog={renderJSONExportDialog}
          renderImageExportDialog={renderImageExportDialog}
          setAppState={setAppState}
          onPenModeToggle={onPenModeToggle}
          renderTopLeftUI={renderTopLeftUI}
          renderTopRightUI={renderTopRightUI}
          renderSidebars={renderSidebars}
          renderWelcomeScreen={renderWelcomeScreen}
          defaultUIEnabled={defaultUIEnabled}
          scrollBackToContentUIEnabled={scrollBackToContentUIEnabled}
        />
      )}
      {editorInterface.formFactor !== "phone" && (
        <>
          {appProps.viewportStatusFrame?.border && (
            <ViewportStatusBorder
              border={appProps.viewportStatusFrame.border}
              style={
                isSidebarDockedAndFits
                  ? {
                      // flush against the sidebar's own visible edge, not
                      // just the --right-sidebar-width column it reserves
                      // (which includes the sidebar's own outer margin)
                      right: `calc(var(--right-sidebar-width) - var(--space-factor) * 2)`,
                    }
                  : undefined
              }
            />
          )}
          <div
            className="layer-ui__wrapper"
            style={
              isSidebarDockedAndFits
                ? { width: `calc(100% - var(--right-sidebar-width))` }
                : {}
            }
          >
            {renderWelcomeScreen && <tunnels.WelcomeScreenCenterTunnel.Out />}

            {/* Selected shape actions (properties panel floats on left side above bottom bar) */}
            {defaultUIEnabled && shouldRenderSelectedShapeActions && (
              <div
                className={clsx("opendraw-selected-shape-actions", {
                  "opendraw-selected-shape-actions--compact":
                    isCompactStylesPanel,
                })}
              >
                {renderSelectedShapeActions()}
                {isCompactStylesPanel && !appState.viewModeEnabled && (
                  <PenModeButton
                    checked={appState.penMode}
                    onChange={() => onPenModeToggle(null)}
                    title={t("toolBar.penMode")}
                    isMobile
                    penDetected={appState.penDetected}
                  />
                )}
              </div>
            )}

            {/* Single unified line for all bottom controls */}
            <div className="opendraw-bottom-bar App-menu App-menu_bottom">
              {/* Left group: Undo/Redo, Zoom */}
              <div className="opendraw-bottom-bar__left">
                {defaultUIEnabled && !appState.viewModeEnabled && (
                  <UndoRedoActions
                    renderAction={actionManager.renderAction}
                    className="zen-mode-transition"
                  />
                )}
                {zoomUIEnabled && app.isNavigationEnabled() && (
                  <ZoomActions renderAction={actionManager.renderAction} />
                )}
              </div>

              {/* Center group: Shapes & Drawing Tools Toolbar + Menu button */}
              <div className="opendraw-bottom-bar__center">
                {defaultUIEnabled &&
                  !appState.viewModeEnabled &&
                  appState.openDialog?.name !== "elementLinkSelector" && (
                    <Section heading="shapes" className="shapes-section">
                      {(heading: React.ReactNode) => (
                        <div style={{ position: "relative" }}>
                          {renderWelcomeScreen && (
                            <tunnels.WelcomeScreenToolbarHintTunnel.Out />
                          )}
                          <Toolbar
                            app={app}
                            appState={appState}
                            setAppState={setAppState}
                            UIOptions={UIOptions}
                            onPenModeToggle={onPenModeToggle}
                            onLockToggle={onLockToggle}
                            heading={heading}
                          />
                        </div>
                      )}
                    </Section>
                  )}
                {renderCanvasActions()}
              </div>

              {/* Right group: Help, ExitZenMode */}
              <div className="opendraw-bottom-bar__right">
                <tunnels.FooterCenterTunnel.Out />
                {defaultUIEnabled && (
                  <div style={{ position: "relative" }}>
                    {renderWelcomeScreen && (
                      <tunnels.WelcomeScreenHelpHintTunnel.Out />
                    )}
                    <HelpButton
                      onClick={() =>
                        actionManager.executeAction(actionShortcuts)
                      }
                    />
                  </div>
                )}
                {defaultUIEnabled && (
                  <ExitZenModeButton
                    actionManager={actionManager}
                    showExitZenModeBtn={showExitZenModeBtn}
                  />
                )}
              </div>
            </div>

            {/* Custom Stats if active */}
            {shouldShowStats && (
              <div className="opendraw-stats">
                <Stats
                  app={app}
                  onClose={() => {
                    actionManager.executeAction(actionToggleStats);
                  }}
                  renderCustomStats={renderCustomStats}
                />
              </div>
            )}
            {(appState.toast ||
              (scrollBackToContentUIEnabled && appState.scrolledOutside) ||
              appProps.viewportStatusFrame?.label) && (
              <div className="floating-status-stack">
                {appState.toast && (
                  <Toast
                    message={appState.toast.message}
                    onClose={() => setAppState({ toast: null })}
                    duration={appState.toast.duration}
                    closable={appState.toast.closable}
                  />
                )}
                {!appState.toast &&
                  scrollBackToContentUIEnabled &&
                  appState.scrolledOutside && (
                    <button
                      type="button"
                      className="scroll-back-to-content"
                      onClick={() => {
                        setAppState((appState) => ({
                          ...getScrollToContentState(elements, appState),
                        }));
                      }}
                    >
                      {t("buttons.scrollBackToContent")}
                    </button>
                  )}
                {appProps.viewportStatusFrame?.label && (
                  <ViewportStatusBadge
                    label={appProps.viewportStatusFrame.label}
                    border={appProps.viewportStatusFrame.border}
                  />
                )}
              </div>
            )}
          </div>
          {renderSidebars()}
        </>
      )}
    </>
  );

  return (
    <UIAppStateContext.Provider value={appState}>
      <TunnelsJotaiProvider>
        <TunnelsContext.Provider value={tunnels}>
          {layerUIJSX}
        </TunnelsContext.Provider>
      </TunnelsJotaiProvider>
    </UIAppStateContext.Provider>
  );
};

const stripIrrelevantAppStateProps = (appState: AppState): UIAppState => {
  const {
    cursorButton,
    scrollX,
    scrollY,
    zoom,
    shouldCacheIgnoreZoom,
    snapLines,
    originSnapOffset,
    suggestedBinding,
    frameToHighlight,
    elementsToHighlight,
    ...ret
  } = appState;
  return ret;
};

const areEqual = (prevProps: LayerUIProps, nextProps: LayerUIProps) => {
  // short-circuit early
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  const { canvas: _pC, appState: prevAppState, ...prev } = prevProps;
  const { canvas: _nC, appState: nextAppState, ...next } = nextProps;

  return (
    isShallowEqual(
      // asserting AppState because we're being passed the whole AppState
      // but resolve to only the UI-relevant props
      stripIrrelevantAppStateProps(prevAppState as AppState),
      stripIrrelevantAppStateProps(nextAppState as AppState),
      {
        selectedElementIds: isShallowEqual,
        selectedGroupIds: isShallowEqual,
      },
    ) && isShallowEqual(prev, next)
  );
};

export default React.memo(LayerUI, areEqual);
