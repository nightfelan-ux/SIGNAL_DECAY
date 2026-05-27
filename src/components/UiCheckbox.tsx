import './ui.css';

type UiCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function UiCheckbox({
  checked,
  onChange,
  label
}: UiCheckboxProps) {
  return (
    <label className="ui-checkbox-row">
      <input
        className="ui-checkbox-native"
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />

      <span
        className={
          checked
            ? 'ui-checkbox-box ui-checkbox-box--checked'
            : 'ui-checkbox-box'
        }
      >
        <span className="ui-checkbox-inner" />
      </span>

      {label && (
        <span className="ui-checkbox-label">
          {label}
        </span>
      )}
    </label>
  );
}