import { useI18n } from "@excalidraw/excalidraw/i18n";
import { WelcomeScreen } from "@excalidraw/excalidraw/index";
import React from "react";

export const AppWelcomeScreen: React.FC = React.memo(() => {
  const { t } = useI18n();

  return (
    <WelcomeScreen>
      <WelcomeScreen.Hints.HelpHint>
        Press ? for shortcuts
      </WelcomeScreen.Hints.HelpHint>
      <WelcomeScreen.Center>
        <WelcomeScreen.Center.Logo />
        <WelcomeScreen.Center.Heading>
          OpenDraw - Offline Whiteboard
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Heading>
          <div style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '1rem', lineHeight: '1.8' }}>
            <div>Click tabs button (→) to manage multiple boards</div>
            <div style={{ marginTop: '0.5rem' }}>Press menu (☰) for all options</div>
          </div>
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Menu>
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
});
