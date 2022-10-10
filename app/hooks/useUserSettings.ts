import type { RootLoaderData } from "~/root";
import { useRouteData } from "remix-utils";

export type UserSettings = {
  warning: number;
  critical: number;
  expandPassLog: boolean;
};

const DEFAULT_USER_SETTINGS = {
  warning: 5,
  critical: 10,
  expandPassLog: false,
};

export const useUserSettings = (): UserSettings => {
  const rootData = useRouteData<RootLoaderData>("root");
  return { ...DEFAULT_USER_SETTINGS, ...rootData?.userSettings };
};
