interface ToggleProps {
  id?: string;
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}

export const Toggle = ({
  id,
  name,
  value,
  defaultChecked,
  children,
}: ToggleProps) => {
  const inputId = id ?? "toggle-id";
  return (
    <label
      htmlFor={inputId}
      className="relative mb-4 flex cursor-pointer items-center gap-5"
    >
      {children}
      <div className="relative">
        <input
          type="checkbox"
          id={inputId}
          className="sr-only"
          defaultChecked={defaultChecked}
        />
        <div className="toggle-bg h-6 w-11 rounded-full border-2 border-gray-200 bg-gray-200"></div>
      </div>
    </label>
  );
};
