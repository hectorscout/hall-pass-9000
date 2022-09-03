import React from "react";

interface ButtonProps {
  type?: "submit" | "button" | "reset";
  kind?: "normal" | "warn" | "ghost";
  name?: string;
  value?: any;
  disabled?: boolean;
  children: React.ReactNode;
}

const kindColors = {
  normal:
    "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300",
  warn: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300",
  ghost: "text-white hover:bg-gray-600 focus:bg-gray-400 disabled:bg-gray-300",
};

export const Button = ({
  type,
  disabled,
  kind = "normal",
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
      className={`rounded py-2 px-4 ${kindColors[kind]}`}
    >
      {children}
    </button>
  );
};
