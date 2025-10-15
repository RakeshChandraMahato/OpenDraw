import "./ExcalidrawLogo.scss";

const LogoIcon = () => (
  <img 
    src="/logo.png" 
    alt="OpenDraw Logo" 
    className="ExcalidrawLogo-icon"
    style={{ width: '120px', height: '120px', objectFit: 'contain' }}
  />
);

const LogoText = () => (
  <svg
    viewBox="0 0 200 55"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    className="ExcalidrawLogo-text"
  >
    <text
      x="10"
      y="40"
      fontFamily="Virgil, Segoe UI Emoji"
      fontSize="42"
      fontWeight="bold"
      fill="#008080"
    >
      OpenDraw
    </text>
  </svg>
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
