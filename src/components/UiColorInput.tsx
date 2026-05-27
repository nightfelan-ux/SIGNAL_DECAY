import {
  useEffect,
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

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#00ff99',
  '#00ffff',
  '#0066ff',
  '#ff0055',
  '#ffcc00',
  '#ff6600',
  '#7a00ff',
  '#101010',
  '#303030',
  '#808080'
];

const normalizeHex = (value: string) => {
  const raw = value.trim();

  if (!raw) return null;

  const withHash = raw.startsWith('#') ? raw : `#${raw}`;

  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toLowerCase();
  }

  return null;
};

const clamp = (
  value: number,
  min: number,
  max: number
) => {
  return Math.max(min, Math.min(max, value));
};

const hexToRgb = (hex: string): RgbColor => {
  const normalized = normalizeHex(hex) ?? '#000000';

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16)
  };
};

const rgbToHex = ({ r, g, b }: RgbColor) => {
  const toHex = (value: number) => {
    return clamp(Math.round(value), 0, 255)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsv = ({ r, g, b }: RgbColor): HsvColor => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === red) {
      h = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      h = 60 * ((blue - red) / delta + 2);
    } else {
      h = 60 * ((red - green) / delta + 4);
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
};

const hsvToRgb = ({ h, s, v }: HsvColor): RgbColor => {
  const chroma = v * s;

  const x =
    chroma *
    (1 - Math.abs(((h / 60) % 2) - 1));

  const m = v - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (h >= 0 && h < 60) {
    red = chroma;
    green = x;
  } else if (h >= 60 && h < 120) {
    red = x;
    green = chroma;
  } else if (h >= 120 && h < 180) {
    green = chroma;
    blue = x;
  } else if (h >= 180 && h < 240) {
    green = x;
    blue = chroma;
  } else if (h >= 240 && h < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255)
  };
};

const getHueColor = (hue: number) => {
  return rgbToHex(
    hsvToRgb({
      h: hue,
      s: 1,
      v: 1
    })
  );
};

export function UiColorInput({
  label,
  value,
  onChange
}: UiColorInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [draftHex, setDraftHex] = useState(value);

  const [hsv, setHsv] = useState<HsvColor>(() =>
    rgbToHsv(hexToRgb(value))
  );

  const [isDraggingColor, setIsDraggingColor] =
    useState(false);

  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition>({
      top: 0,
      left: 0
    });

  const safeValue = normalizeHex(value) ?? '#000000';
  const hueColor = getHueColor(hsv.h);

  const updatePopoverPosition = () => {
    const root = rootRef.current;

    if (!root) return;

    const rootRect = root.getBoundingClientRect();

    const popoverHeight =
      popoverRef.current?.offsetHeight ?? 360;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const preferredLeft = rootRect.right - POPOVER_WIDTH;

    const left = clamp(
      preferredLeft,
      POPOVER_MARGIN,
      viewportWidth - POPOVER_WIDTH - POPOVER_MARGIN
    );

    const bottomTop = rootRect.bottom + 6;
    const topTop = rootRect.top - popoverHeight - 6;

    const hasSpaceBelow =
      bottomTop + popoverHeight <=
      viewportHeight - POPOVER_MARGIN;

    const hasSpaceAbove =
      topTop >= POPOVER_MARGIN;

    let top = bottomTop;

    if (!hasSpaceBelow && hasSpaceAbove) {
      top = topTop;
    }

    if (!hasSpaceBelow && !hasSpaceAbove) {
      top = clamp(
        bottomTop,
        POPOVER_MARGIN,
        viewportHeight - popoverHeight - POPOVER_MARGIN
      );
    }

    setPopoverPosition({
      top,
      left
    });
  };

  useEffect(() => {
    const normalized = normalizeHex(value);

    if (!normalized) return;

    setDraftHex(normalized.toUpperCase());
    setHsv(rgbToHsv(hexToRgb(normalized)));
  }, [value]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();

    const animationFrame = requestAnimationFrame(() => {
      updatePopoverPosition();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => {
      updatePopoverPosition();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener(
        'scroll',
        handleWindowChange,
        true
      );
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideRoot =
        rootRef.current?.contains(target);

      const clickedInsidePopover =
        popoverRef.current?.contains(target);

      if (!clickedInsideRoot && !clickedInsidePopover) {
        setIsOpen(false);

        const normalized = normalizeHex(draftHex);

        if (normalized) {
          onChange(normalized);
        } else {
          setDraftHex(safeValue.toUpperCase());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [draftHex, onChange, safeValue]);

  useEffect(() => {
    const stopDragging = () => {
      setIsDraggingColor(false);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingColor) return;

      updateColorFromPointer(event.clientX, event.clientY);
    };

    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener(
        'pointermove',
        handlePointerMove
      );
    };
  }, [isDraggingColor, hsv.h]);

  const commitHsv = (nextHsv: HsvColor) => {
    const nextHex = rgbToHex(hsvToRgb(nextHsv));

    setHsv(nextHsv);
    setDraftHex(nextHex.toUpperCase());
    onChange(nextHex);
  };

  const commitHex = (nextValue: string) => {
    setDraftHex(nextValue);

    const normalized = normalizeHex(nextValue);

    if (!normalized) return;

    const nextHsv = rgbToHsv(hexToRgb(normalized));

    setHsv(nextHsv);
    onChange(normalized);
  };

  const updateColorFromPointer = (
    clientX: number,
    clientY: number
  ) => {
    const area = colorAreaRef.current;

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

    commitHsv({
      h: hsv.h,
      s: x,
      v: 1 - y
    });
  };

  return (
    <div
      className="ui-color-root"
      ref={rootRef}
    >
      <div className="ui-color-label">{label}</div>

      <div className="ui-color-control">
        <input
          className="ui-color-text"
          value={draftHex.toUpperCase()}
          onChange={(event) => {
            commitHex(event.target.value);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          spellCheck={false}
        />

        <button
          type="button"
          className="ui-color-preview"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          style={{
            background: safeValue
          }}
          aria-label={`${label} color picker`}
        />
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="ui-color-popover"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
            width: POPOVER_WIDTH
          }}
        >
          <div className="ui-color-popover-title">
            PICK COLOR
          </div>

          <div
            ref={colorAreaRef}
            className="ui-color-area"
            style={{
              backgroundColor: hueColor
            }}
            onPointerDown={(event) => {
              setIsDraggingColor(true);

              updateColorFromPointer(
                event.clientX,
                event.clientY
              );
            }}
          >
            <div className="ui-color-area-white" />
            <div className="ui-color-area-black" />

            <div
              className="ui-color-area-cursor"
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`
              }}
            />
          </div>

          <div className="ui-hue-row">
            <div className="ui-hue-label">HUE</div>

            <input
              className="ui-hue-slider"
              type="range"
              min={0}
              max={360}
              step={1}
              value={Math.round(hsv.h)}
              onChange={(event) => {
                commitHsv({
                  ...hsv,
                  h: Number(event.target.value)
                });
              }}
            />
          </div>

          <div className="ui-color-presets">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={
                  color.toLowerCase() === safeValue
                    ? 'ui-color-preset ui-color-preset--active'
                    : 'ui-color-preset'
                }
                style={{
                  background: color
                }}
                onClick={() => {
                  const nextHsv = rgbToHsv(hexToRgb(color));

                  setHsv(nextHsv);
                  setDraftHex(color.toUpperCase());
                  onChange(color);
                }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>

          <div className="ui-color-selected-hex">
            <span>HEX</span>

            <input
              value={draftHex.toUpperCase()}
              onChange={(event) => {
                commitHex(event.target.value);
              }}
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}