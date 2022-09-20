import { RootLoaderData } from "~/root";
import { useRouteData } from "remix-utils";

type UserSettings = {
  warning: number;
  critical: number;
};

const DEFAULT_USER_SETTINGS = {
  warning: 5,
  critical: 10,
};

export const useUserSettings = (): UserSettings => {
  const rootData = useRouteData<RootLoaderData>("root");
  return { ...DEFAULT_USER_SETTINGS, ...rootData?.userSettings };
};
