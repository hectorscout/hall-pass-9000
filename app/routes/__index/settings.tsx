import { Form, useMatches } from "@remix-run/react";
import { useRouteData } from "remix-utils";
import { RootLoaderData } from "../../root";

export default function SettingsRoute() {
  const rootData = useRouteData<RootLoaderData>("root");
  // const  = useMatches();
  console.log(rootData?.userSettings);
  // console.log(matches);

  return (
    <Form>
      <div>Warning:</div>
      <div>Critical:</div>
    </Form>
  );
}
