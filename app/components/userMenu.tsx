import { Form, Link } from "@remix-run/react";

interface UserMenuProps {
  username: string;
}

export const UserMenu = ({ username }: UserMenuProps) => {
  return (
    <div className="absolute -right-5 -bottom-5 z-50 mt-5 flex translate-y-full flex-col whitespace-nowrap rounded border bg-gray-100">
      <Form action="/logout" method="post" className="p-5">
        <button
          type="submit"
          // className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout {username}
        </button>
      </Form>
      <Link to={"/settings"} className="border-t p-5">
        Settings
      </Link>
    </div>
  );
};
