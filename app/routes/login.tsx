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
    <main className="relative min-h-screen bg-gray-800 sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1527430253228-e93688616381?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE1NzIyNzc&ixlib=rb-1.2.1&q=80"
                alt="A Robot"
              />
              <div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-red-500 drop-shadow-md">
                  Hall Pass 9000
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                I'm sorry Ethan, I'm afraid I can't do that.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <form action="/auth/google" method="POST" className="space-y-6">
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                  >
                    Login with Google
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
// export default function LoginPage() {
//   return (
//     <>
//       <div className="flex min-h-full">
//         <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
//           <div className="mx-auto w-full max-w-sm lg:w-96">
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">🪵 into your account</h2>
//
//             <div className="mt-6">
//               <form action="/auth/google" method="POST" className="space-y-6">
//                 <button className="w-full" type="submit" kind="black" size="lg">
//                   {/*<Github className="mr-2 h-5 w-5" /> Sign in with Github*/} login
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//         <div className="relative hidden w-0 flex-1 lg:block">
//           <img
//             className="absolute inset-0 h-full w-full object-cover"
//             src="https://images.unsplash.com/photo-1527430253228-e93688616381?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE1NzIyNzc&ixlib=rb-1.2.1&q=80"
//             alt=""
//           />
//         </div>
//       </div>
//     </>
//   );
// }
