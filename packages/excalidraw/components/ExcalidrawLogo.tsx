import "./ExcalidrawLogo.scss";

const LogoIcon = () => (
  <img
    src="/opendraw-logo.png"
    alt="OpenDraw"
    className="ExcalidrawLogo-icon"
  />
);

const LogoText = () => (
  <div className="ExcalidrawLogo-text">
    <span className="ExcalidrawLogo-title">OpenDraw</span>
    <span className="ExcalidrawLogo-subtitle">by RakeshXapp</span>
  </div>
);

type LogoSize = "xs" | "small" | "normal" | "large" | "custom" | "mobile";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  style?: React.CSSProperties;
  /**
   * If true, the logo will not be wrapped in a Link component.
   * The link prop will be ignored as well.
   * It will merely be a plain div.
   */
  isNotLink?: boolean;
}

export const ExcalidrawLogo = ({
  style,
  size = "small",
  withText,
}: LogoProps) => {
  return (
    <div className={`ExcalidrawLogo is-${size}`} style={style}>
      <LogoIcon />
      {withText && <LogoText />}
    </div>
  );
};
