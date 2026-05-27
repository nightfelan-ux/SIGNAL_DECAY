import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import './ui.css';

type UiSelectOption = {
  value: string;
  label: string;
};

type UiSelectProps = {
  value: string;
  options: UiSelectOption[];
  onChange: (value: string) => void;
};

export function UiSelect({
  value,
  options,
  onChange
}: UiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef =
    useRef<HTMLButtonElement | null>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const visibleLabel = selectedOption
    ? selectedOption.label
    : value;

  useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDownOutside
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDownOutside
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    const selected = selectedOptionRef.current;

    if (!menu || !selected) return;

    const selectedTop = selected.offsetTop;
    const selectedHeight = selected.offsetHeight;
    const menuHeight = menu.clientHeight;

    menu.scrollTop = Math.max(
      0,
      selectedTop - menuHeight / 2 + selectedHeight / 2
    );
  }, [isOpen, value, options.length]);

  return (
    <div
      className="ui-select-root"
      ref={rootRef}
    >
      <button
        type="button"
        className={
          isOpen
            ? 'ui-select-trigger ui-select-trigger--open'
            : 'ui-select-trigger'
        }
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setIsOpen((current) => !current);
        }}
      >
        <span>{visibleLabel}</span>

        <span
          className={
            isOpen
              ? 'ui-select-arrow ui-select-arrow--open'
              : 'ui-select-arrow'
          }
        />
      </button>

      {isOpen && (
        <div
          className="ui-select-menu"
          ref={menuRef}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                ref={(node) => {
                  if (selected) {
                    selectedOptionRef.current = node;
                  }
                }}
                type="button"
                className={
                  selected
                    ? 'ui-select-option ui-select-option--selected'
                    : 'ui-select-option'
                }
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}