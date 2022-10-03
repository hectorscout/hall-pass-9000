interface DurationInputProps {
  duration: Duration;
  updateDuration: Function;
}

export const DurationInput = ({
  duration,
  updateDuration,
}: DurationInputProps) => {
  return (
    <div className="text-6xl text-gray-900">
      {duration.days ? (
        <>
          <label className="font-mono text-gray-900">
            {(duration.days ?? 0) < 10 ? "0" : null}
            <input
              className={`relative appearance-none border-none bg-gray-100 p-1 outline-none ${
                (duration.days ?? 0) < 10 ? "w-14" : "w-24"
              }`}
              type="number"
              min="0"
              value={duration.days}
              onChange={({ target: { value } }) =>
                updateDuration({ days: parseInt(value) })
              }
            />
          </label>{" "}
          :
        </>
      ) : null}
      <label className="font-mono text-gray-900">
        {(duration.hours ?? 0) < 10 ? "0" : null}
        <input
          className={`relative appearance-none border-none bg-gray-100 bg-gray-100 p-1 outline-none ${
            (duration.hours ?? 0) < 10 ? "w-14" : "w-24"
          }`}
          type="number"
          max="23"
          min={duration.days === 0 ? "0" : undefined}
          value={duration.hours}
          onChange={({ target: { value } }) =>
            updateDuration({ hours: parseInt(value) })
          }
        />
      </label>
      :
      <label className="font-mono text-gray-900">
        {(duration.minutes ?? 0) < 10 ? "0" : null}
        <input
          className={`relative appearance-none border-none bg-gray-100 bg-gray-100 p-1 outline-none ${
            (duration.minutes ?? 0) < 10 ? "w-14" : "w-24"
          }`}
          type="number"
          min={duration.hours === 0 ? "0" : undefined}
          value={duration.minutes}
          onChange={({ target: { value } }) =>
            updateDuration({ minutes: parseInt(value) })
          }
        />
      </label>
      :
      <label className="font-mono text-gray-900">
        {(duration.seconds ?? 0) < 10 ? "0" : null}
        <input
          className={`relative appearance-none border-none bg-gray-100 p-1 outline-none ${
            (duration.seconds ?? 0) < 10 ? "w-14" : "w-24"
          }`}
          type="number"
          min={duration.minutes === 0 ? "0" : undefined}
          value={duration.seconds}
          onChange={({ target: { value } }) =>
            updateDuration({ seconds: parseInt(value) })
          }
        />
      </label>
    </div>
  );
};
