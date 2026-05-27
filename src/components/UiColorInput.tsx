import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import './ui.css';

type UiColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HsvColor = {
  h: number;
  s: number;
  v: number;
};

type PopoverPosition = {
  top: number;
  left: number;
};

const POPOVER_WIDTH = 240;
const POPOVER_MARGIN = 12;
const GLOBAL_COLOR_OPEN_EVENT = 'ui-color-input-open';

const PRESET_COLORS = [
  '#00ff99',
  '#d6ff00',
  '#00c8ff',
  '#ff00cc',
  '#ff003c',
  '#ffcc00',
  '#ffffff',
  '#050505'
];

export function UiColorInput({
  label,
  value,
  onChange
}: UiColorInputProps) {
  const id = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition>({
      top: 0,
      left: 0
    });

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hsv = hexToHsv(value);

  const updatePopoverPosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const estimatedHeight = 340;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + POPOVER_WIDTH > viewportWidth - POPOVER_MARGIN) {
      left = viewportWidth - POPOVER_WIDTH - POPOVER_MARGIN;
    }

    if (left < POPOVER_MARGIN) {
      left = POPOVER_MARGIN;
    }

    if (top + estimatedHeight > viewportHeight - POPOVER_MARGIN) {
      top = rect.top - estimatedHeight - 8;
    }

    if (top < POPOVER_MARGIN) {
      top = POPOVER_MARGIN;
    }

    setPopoverPosition({
      top,
      left
    });
  };

  const openPopover = () => {
    window.dispatchEvent(
      new CustomEvent(GLOBAL_COLOR_OPEN_EVENT, {
        detail: {
          id
        }
      })
    );

    setIsOpen(true);
  };

  const closePopover = () => {
    setIsOpen(false);
  };

  const togglePopover = () => {
    if (isOpen) {
      closePopover();
      return;
    }

    openPopover();
  };

  useEffect(() => {
    const handleGlobalOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{
        id: string;
      }>;

      if (customEvent.detail?.id !== id) {
        setIsOpen(false);
      }
    };

    window.addEventListener(
      GLOBAL_COLOR_OPEN_EVENT,
      handleGlobalOpen
    );

    return () => {
      window.removeEventListener(
        GLOBAL_COLOR_OPEN_EVENT,
        handleGlobalOpen
      );
    };
  }, [id]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      const root = rootRef.current;
      const popover = popoverRef.current;

      const clickedInsideRoot =
        root && root.contains(target);

      const clickedInsidePopover =
        popover && popover.contains(target);

      if (clickedInsideRoot || clickedInsidePopover) {
        return;
      }

      closePopover();
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();

    const handleViewportChange = () => {
      updatePopoverPosition();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true
      );
    };
  }, [isOpen]);

  const updateFromHsv = (nextHsv: HsvColor) => {
    onChange(hsvToHex(nextHsv));
  };

  return (
    <div
      className="ui-color-root"
      ref={rootRef}
    >
      <div className="ui-color-label">
        {label}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="ui-color-control"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePopover();
        }}
      >
        <span className="ui-color-hex">
          {value.toUpperCase()}
        </span>

        <span
          className="ui-color-preview"
          style={{
            background: value
          }}
        />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="ui-color-popover"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
            width: POPOVER_WIDTH
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <ColorArea
            hsv={hsv}
            onChange={updateFromHsv}
          />

          <HueSlider
            hsv={hsv}
            onChange={updateFromHsv}
          />

          <div className="ui-color-presets">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="ui-color-preset"
                style={{
                  background: color
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(color);
                }}
              />
            ))}
          </div>

          <input
            className="ui-color-hex-input"
            value={value.toUpperCase()}
            spellCheck={false}
            onChange={(event) => {
              const nextValue = event.target.value.trim();

              if (isValidHex(nextValue)) {
                onChange(normalizeHex(nextValue));
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function ColorArea({
  hsv,
  onChange
}: {
  hsv: HsvColor;
  onChange: (value: HsvColor) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);

  const handlePointer = (clientX: number, clientY: number) => {
    const area = areaRef.current;

    if (!area) return;

    const rect = area.getBoundingClientRect();

    const x = clamp(
      (clientX - rect.left) / rect.width,
      0,
      1
    );

    const y = clamp(
      (clientY - rect.top) / rect.height,
      0,
      1
    );

    onChange({
      ...hsv,
      s: x,
      v: 1 - y
    });
  };

  return (
    <div
      ref={areaRef}
      className="ui-color-area"
      style={{
        background: `hsl(${hsv.h}, 100%, 50%)`
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        handlePointer(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.buttons !== 1) return;

        handlePointer(event.clientX, event.clientY);
      }}
    >
      <div className="ui-color-area-white" />
      <div className="ui-color-area-black" />

      <div
        className="ui-color-area-handle"
        style={{
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`
        }}
      />
    </div>
  );
}

function HueSlider({
  hsv,
  onChange
}: {
  hsv: HsvColor;
  onChange: (value: HsvColor) => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlePointer = (clientX: number) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const rect = slider.getBoundingClientRect();

    const x = clamp(
      (clientX - rect.left) / rect.width,
      0,
      1
    );

    onChange({
      ...hsv,
      h: Math.round(x * 360)
    });
  };

  return (
    <div
      ref={sliderRef}
      className="ui-color-hue"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        handlePointer(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.buttons !== 1) return;

        handlePointer(event.clientX);
      }}
    >
      <div
        className="ui-color-hue-handle"
        style={{
          left: `${(hsv.h / 360) * 100}%`
        }}
      />
    </div>
  );
}

function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHex(hex);

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16)
  };
}

function rgbToHex({
  r,
  g,
  b
}: RgbColor) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value: number) {
  return Math.round(value)
    .toString(16)
    .padStart(2, '0');
}

function hexToHsv(hex: string): HsvColor {
  const { r, g, b } = hexToRgb(hex);

  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const max = Math.max(
    normalizedR,
    normalizedG,
    normalizedB
  );

  const min = Math.min(
    normalizedR,
    normalizedG,
    normalizedB
  );

  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === normalizedR) {
      h =
        60 *
        (((normalizedG - normalizedB) / delta) % 6);
    } else if (max === normalizedG) {
      h =
        60 *
        ((normalizedB - normalizedR) / delta + 2);
    } else {
      h =
        60 *
        ((normalizedR - normalizedG) / delta + 4);
    }
  }

  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    h,
    s,
    v
  };
}

function hsvToHex({
  h,
  s,
  v
}: HsvColor) {
  const c = v * s;
  const x =
    c *
    (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255
  });
}

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith('#')) {
    return `#${trimmed}`;
  }

  return trimmed;
}

function isValidHex(value: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(value);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}