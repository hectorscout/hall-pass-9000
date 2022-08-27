import { GoogleStrategy } from "remix-auth-google";
import { prisma } from "~/utils/db.server";

// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import {sessionStorage} from "~/utils/session.server";
import type { User } from "@prisma/client";
import { getRequiredEnvVariable } from "~/utils/utils";
import { json } from "@remix-run/node";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
type AuthenticatedUser = User & { profileImgUrl: string | null };
export const authenticator = new Authenticator<AuthenticatedUser>(sessionStorage);

const host = process.env.PUBLIC_HOST || "http://localhost:3000";
const clientID = getRequiredEnvVariable("GOOGLE_CLIENT_ID");
const clientSecret = getRequiredEnvVariable("GOOGLE_CLIENT_SECRET");

const googleStrategy = new GoogleStrategy(
  {
    clientID,
    clientSecret,
    scope: "openid email profile",
    callbackURL: `${host}/auth/google/callback`,
  },
  async ({ accessToken, extraParams, profile }) => {
    try {
      // Get the user data from your DB or API using the tokens and profile
      const user = await prisma.user.upsert({
        where: { externalId: profile.id },
        update: { displayName: profile.displayName, profileImgUrl: profile.photos[0]?.value },
        create: {
          externalId: profile.id,
          displayName: profile.displayName,
          profileImgUrl: profile.photos[0]?.value,
          email: profile.emails[0].value
        },
      });

      return {
        ...user,
        profileImgUrl: profile.photos[0]?.value ?? null,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
);

// Tell the Authenticator to use the form strategy
authenticator.use(
  googleStrategy,
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'google'
);

export async function assertUser(request: Request): Promise<AuthenticatedUser> {
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return user;
  }

  throw json("Unauthorized", { status: 401 });
}
