import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="absolute top-0 bottom-0 right-0 left-0 flex flex-1 flex-col items-center justify-center gap-5 self-center justify-self-center bg-gray-400 opacity-60 ">
      <div className="text-5xl">{message}</div>
      <ArrowPathIcon className="h-24 w-24 animate-spin" />
    </div>
  );
}
