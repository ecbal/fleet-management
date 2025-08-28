import React, { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = forwardRef(
  (
    {
      // Davranış
      checked,                  // kontrollü kullanım (boolean)
      defaultChecked = false,   // kontrolsüz başlangıç
      onChange,                 // (next: boolean) => void
      disabled = false,

      // Görünüm
      size = "md",              // "sm" | "md" | "lg"
      color = "#109ac4",        // açık durum rengi (CSS color)
      label,                    // erişilebilirlik etiketi
      className = "",
      style,

      // Form entegrasyonu (opsiyonel)
      name,
      id,
    },
    ref
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = useState(defaultChecked);
    const value = isControlled ? checked : internal;

    const handleToggle = () => {
      if (disabled) return;
      const next = !value;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const handleKeyDown = (e) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle();
      }
    };

    useImperativeHandle(ref, () => ({
      focus: () => document.getElementById(id || "__tswitch")?.focus(),
    }));

    const cssVars = useMemo(
      () => ({ "--switch-on": color }),
      [color]
    );

    return (
      <span
        id={id || "__tswitch"}
        role="switch"
        aria-checked={value}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        className={[
          "toggle-switch",
          `ts-${size}`,
          value ? "is-on" : "is-off",
          disabled ? "is-disabled" : "",
          className,
        ].join(" ")}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{ ...cssVars, ...style }}
      >
        <span className="ts-track" />
        <span className="ts-thumb" />
        {/* Formlar için gizli checkbox */}
        {name && (
          <input
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={() => {}}
            readOnly
            hidden
          />
        )}
      </span>
    );
  }
);

export default ToggleSwitch;
