import './ui.css';

type UiSliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
};

const formatSliderValue = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '');
};

export function UiSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue
}: UiSliderProps) {
  const percent =
    max === min
      ? 0
      : ((value - min) / (max - min)) * 100;

  return (
    <div className="ui-slider-root">
      <div className="ui-slider-value">
        {displayValue ?? formatSliderValue(value)}
      </div>

      <div className="ui-slider-wrap">
        <input
          className="ui-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          style={{
            background: `linear-gradient(
              to right,
              #00ff99 0%,
              #00ff99 ${percent}%,
              #191919 ${percent}%,
              #191919 100%
            )`
          }}
        />
      </div>
    </div>
  );
}