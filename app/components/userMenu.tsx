import { Link } from "@remix-run/react";

interface UserMenuProps {
  username: string;
}

export const UserMenu = ({ username }: UserMenuProps) => {
  return (
    <div className="absolute -right-5 -bottom-2 z-50 mt-5 flex translate-y-full flex-col whitespace-nowrap rounded border bg-gray-100">
      <Link to="/logout" className="p-5 hover:bg-gray-200">
        Logout {username}
      </Link>
      <Link to={"/admin"} className="border-t p-5 hover:bg-gray-200">
        Admin
      </Link>
    </div>
  );
};
