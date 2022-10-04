interface DurationInputProps {
  duration: Duration;
  updateDuration: Function;
}

const renderInput = ({
  value,
  min,
  max,
  onValueChange,
}: {
  value?: number;
  min?: number;
  max?: number;
  onValueChange: Function;
}) => {
  return (
    <label className="font-mono text-gray-900">
      {(value ?? 0) < 10 ? "0" : null}
      <input
        className={`relative appearance-none border-none bg-gray-100 p-1 outline-none ${
          (value ?? 0) < 10 ? "w-14" : "w-24"
        }`}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={({ target: { value } }) => onValueChange(parseInt(value))}
      />
    </label>
  );
};

export const DurationInput = ({
  duration,
  updateDuration,
}: DurationInputProps) => {
  return (
    <div className="text-6xl text-gray-900">
      {duration.days ? (
        <>
          {renderInput({
            value: duration.days,
            min: 0,
            max: 28,
            onValueChange: (value: number) => updateDuration({ days: value }),
          })}
          :
        </>
      ) : null}
      {renderInput({
        value: duration.hours,
        min: duration.days === 0 ? 0 : undefined,
        max: 23,
        onValueChange: (value: number) => updateDuration({ hours: value }),
      })}
      :
      {renderInput({
        value: duration.minutes,
        min: duration.hours === 0 ? 0 : undefined,
        onValueChange: (value: number) => updateDuration({ minutes: value }),
      })}
      :
      {renderInput({
        value: duration.seconds,
        min: duration.minutes === 0 ? 0 : undefined,
        onValueChange: (value: number) => updateDuration({ seconds: value }),
      })}
    </div>
  );
};
