import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as React from "react";

import { getUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  return (
    <>
      <div className="flex min-h-full">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">🪵 into your account</h2>

            <div className="mt-6">
              <form action="/auth/google" method="POST" className="space-y-6">
                <button className="w-full" type="submit" kind="black" size="lg">
                  {/*<Github className="mr-2 h-5 w-5" /> Sign in with Github*/} login
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1527430253228-e93688616381?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE1NzIyNzc&ixlib=rb-1.2.1&q=80"
            alt=""
          />
        </div>
      </div>
    </>
  );
}
