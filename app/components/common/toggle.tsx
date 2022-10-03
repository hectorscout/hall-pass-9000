export const Toggle = () => {
  return (
    <label
      htmlFor="toggle"
      className="relative mb-4 flex cursor-pointer items-center"
    >
      <input type="checkbox" id="toggle" className="sr-only" />
      <div className="toggle-bg h-6 w-11 rounded-full border-2 border-gray-200 bg-gray-200"></div>
      <span className="ml-3 text-sm font-medium text-gray-900">Toggle me</span>
    </label>
  );
};
