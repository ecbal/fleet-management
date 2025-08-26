import React, { useEffect, useRef, useState } from "react";
import "./SearchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCircleXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";

/**
 * SearchBar
 * Props:
 * - placeholder?: string
 * - defaultValue?: string
 * - debounceMs?: number (default 300)
 * - getSuggestions?: (query: string) => Promise<Array<string | {id: string|number, label: string}>>
 * - onSubmit?: (query: string) => void
 * - onSelect?: (item: {id: string|number, label: string} | string) => void
 * - className?: string
 * - autoFocus?: boolean
 */
export default function SearchBar({
  placeholder = "Ara...",
  defaultValue = "",
  debounceMs = 300,
  getSuggestions,
  onSubmit,
  onSelect,
  className = "",
  autoFocus = false,
  autocomplete = true,
  ...rest // ← TÜM DİĞER input props'ları buraya gelir
}) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState(-1);

  const rootRef = useRef(null);
  const listId = "searchbar-listbox";
  const inputId = "searchbar-input";

  // Dışarı tıklandığında listeyi kapat
  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounce + öneri çekme
  useEffect(() => {
    if (!getSuggestions) return;

    if (!query.trim()) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      let active = true;
      try {
        const res = await getSuggestions(query.trim());
        if (!active) return;

        // Normalize et (string veya {id,label})
        const normalized = (res || []).map((r, idx) =>
          typeof r === "string" ? { id: idx, label: r } : r
        );
        setItems(normalized);
        setOpen(true);
        setHighlight(normalized.length ? 0 : -1);
      } catch (err) {
        console.error("getSuggestions error:", err);
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
      return () => { active = false; };
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, getSuggestions]);

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (items.length ? (h + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (items.length ? (h - 1 + items.length) % items.length : -1));
    } else if (e.key === "Enter") {
      if (open && highlight >= 0 && items[highlight]) {
        handleSelect(items[highlight]);
      } else if (onSubmit) {
        onSubmit(query.trim());
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const handleSelect = (item) => {
    const value = typeof item === "string" ? item : item.label;
    setQuery(value);
    setOpen(false);
    setHighlight(-1);
    onSelect?.(item);
    // İstersen Enter gibi submit de ettirebilirsin:
    // onSubmit?.(value);
  };

  const handleClear = () => {
    setQuery("");
    setItems([]);
    setOpen(false);
    setHighlight(-1);
  };

  return (
    <div
      ref={rootRef}
      className={`searchbar ${className}`}
      role="combobox"
      aria-expanded={open}
      aria-owns={listId}
      aria-haspopup="listbox"
    >
      <div className="searchbar__control">
        <span className="searchbar__icon" aria-hidden="true">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>

        <input
          id={inputId}
          className="searchbar__input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => (items.length ? setOpen(true) : null)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={open && highlight >= 0 ? `${listId}-opt-${highlight}` : undefined}
          {...rest} // ← burası önemli!
        />


        <span className="searchbar__actions">
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
          ) : query ? (
            <button
              type="button"
              className="searchbar__clear"
              aria-label="Temizle"
              onClick={handleClear}
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>
          ) : null}
        </span>
      </div>

      {open && items.length > 0 && (
        <ul className="searchbar__list" role="listbox" id={listId}>
          {items.map((it, idx) => {
            const label = typeof it === "string" ? it : it.label;
            const isActive = idx === highlight;
            return (
              <li
                key={it.id ?? idx}
                id={`${listId}-opt-${idx}`}
                role="option"
                aria-selected={isActive}
                className={`searchbar__option ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => e.preventDefault()} // focus kaybını engelle
                onClick={() => handleSelect(it)}
                title={label}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
