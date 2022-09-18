import { Link } from "@remix-run/react";
import { Hal9000 } from "~/components/hal9000/hal9000";
import { UserMenu } from "~/components/userMenu";
import { useState } from "react";

interface HeaderProps {
  profileImgUrl: string | null;
  username: string;
}

export const Header = ({ profileImgUrl, username }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const closeUserMenu = () => {
    setShowUserMenu(false);
    document.removeEventListener("click", closeUserMenu);
  };
  const toggleUserMenu = () => {
    if (!showUserMenu) {
      document.addEventListener("click", closeUserMenu);
      setShowUserMenu(true);
    } else closeUserMenu();
  };

  return (
    <header className="border-primary-600 bg-gray-800">
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
          <div className="relative">
            {profileImgUrl ? (
              <img
                className="ml-10 inline-block h-10 w-10 cursor-pointer rounded-full"
                src={profileImgUrl}
                alt={username}
                onClick={toggleUserMenu}
              />
            ) : null}
            {showUserMenu ? <UserMenu username={username} /> : null}
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
