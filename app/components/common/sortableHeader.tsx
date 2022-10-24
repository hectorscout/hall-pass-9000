import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { Link, useSearchParams } from "@remix-run/react";

interface SortableHeaderProps {
  title?: string;
  sortKey: string;
  children?: React.ReactNode;
}

export default function SortableHeader({
  title,
  sortKey,
  children,
}: SortableHeaderProps) {
  const [searchParams] = useSearchParams();
  const currentSortKey = searchParams.get("sort-key");
  const currentDesc = searchParams.get("desc");
  const nextDesc = sortKey === currentSortKey ? !currentDesc : false;

  return (
    <Link
      to={`?sort-key=${sortKey}${nextDesc ? "&desc=1" : ""}`}
      className="group flex cursor-pointer items-center gap-1"
    >
      {title ?? children}
      <div
        className={currentSortKey !== sortKey ? `hidden group-hover:block` : ""}
      >
        {currentSortKey === sortKey ? (
          currentDesc ? (
            <ArrowDownIcon className="h-6 w-6" />
          ) : (
            <ArrowUpIcon className="h-6 w-6" />
          )
        ) : (
          <ArrowsUpDownIcon className="h-6 w-6" />
        )}
      </div>
    </Link>
  );
}
