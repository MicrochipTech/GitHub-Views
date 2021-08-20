import React from "react";

interface CenterProps {
  className?: string;
}

const Center: React.FC<CenterProps> = ({ children, className }) => {
  return (
    <div
      className={className ?? ""}
      style={{ display: "flex", justifyContent: "center" }}
    >
      {children}
    </div>
  );
};

export default Center;
