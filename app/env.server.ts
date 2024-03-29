export function getEnv() {
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
