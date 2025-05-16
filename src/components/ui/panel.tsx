
import React from "react";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface PanelProps {
  children: React.ReactNode;
  position?: Position;
  style?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({ children, position = "top-left", style = {} }) => {
  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case "top-left":
        return { top: 10, left: 10 };
      case "top-right":
        return { top: 10, right: 10 };
      case "bottom-left":
        return { bottom: 10, left: 10 };
      case "bottom-right":
        return { bottom: 10, right: 10 };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        ...getPositionStyles(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
