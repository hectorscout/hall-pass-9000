import { Button } from "~/components/common/button";
import {
  ArrowsPointingOutIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useParams, useTransition } from "@remix-run/react";
import { RocketIcon } from "~/components/common/rocketIcon";

const renderTransitionButton = () => {
  return (
    <Button disabled={true} size="big">
      <div className="flex items-center justify-center gap-5">
        <ArrowsPointingOutIcon className="h-12 w-12" />
        Opening Pod Bay Doors...
        <ArrowsPointingOutIcon className="h-12 w-12" />
      </div>
    </Button>
  );
};

export const PassButton = () => {
  const transition = useTransition();
  const { studentId } = useParams();

  const isTransitioning =
    transition.location?.pathname === `/${studentId}` &&
    ["actionSubmission", "actionReload"].includes(transition.type);

  return isTransitioning ? (
    renderTransitionButton()
  ) : (
    <div className="flex flex-col gap-5 rounded-2xl bg-gray-800/80 p-5 text-gray-300">
      <div className="text-5xl">Start A New Space Walk</div>
      <Button type="submit" name="passId" value="personal" size="big">
        <div className="flex items-center justify-center gap-5">
          <RocketIcon />
          Recreational
          <RocketIcon />
        </div>
      </Button>
      <Button
        type="submit"
        name="passId"
        value="official"
        size="big"
        kind="info"
        title={`"Official" space walks don't contribute to overall counts and durations`}
      >
        <div className="flex items-center justify-center gap-5">
          <CheckBadgeIcon className="inline-block h-12 w-12" />
          Official Business
          <CheckBadgeIcon className="inline-block h-12 w-12" />
        </div>
      </Button>
    </div>
  );
};
