import React from "react";

interface ButtonProps {
  type?: "submit" | "button" | "reset";
  kind?: "good" | "warning" | "critical" | "ghost";
  size?: "normal" | "big";
  name?: string;
  value?: any;
  disabled?: boolean;
  children: React.ReactNode;
}

const kindColors = {
  good: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300",
  warning:
    "bg-red-500 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300",
  critical:
    "bg-red-500 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300",
  ghost: "text-white hover:bg-gray-600 focus:bg-gray-400 disabled:bg-gray-300",
};

const sizes = {
  normal: "py-2 px-4",
  big: "py-12 px-14 text-3xl",
};

export const Button = ({
  type,
  disabled,
  kind = "good",
  size = "normal",
  name,
  value,
  children,
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      type={type}
      name={name}
      value={value}
      className={`rounded ${kindColors[kind]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
};
