import { Form, Link } from "@remix-run/react";
import { Hal9000 } from "~/components/hal9000/hal9000";

interface HeaderProps {
  profileImgUrl: string | null;
  username: string;
}

export const Header: React.FC<HeaderProps> = ({ profileImgUrl, username }) => {
  return (
    <header className="border-primary-600 border-b-4 bg-gray-800">
      <nav className="px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Hal9000 />
              <h1 className="ml-10 text-2xl font-extrabold text-red-600 sm:text-3xl">
                Hall Pass 9000
              </h1>
            </Link>
          </div>
          <div className="flex flex-row">
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
              >
                Logout {username}
              </button>
            </Form>
            {profileImgUrl ? (
              <img
                className="ml-10 inline-block h-10 w-10 rounded-full"
                src={profileImgUrl}
                alt={username}
              />
            ) : null}
          </div>
          {/*<div className="ml-10 flex shrink-0 items-center space-x-4">*/}
          {/*  {}*/}
          {/*  /!*<UserMenu profileImgUrl={profileImgUrl} username={username} />*!/*/}
          {/*</div>*/}
        </div>
      </nav>
    </header>
  );
};
