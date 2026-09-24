"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { EstablishmentAddress } from "@/types";
import { searchAddresses, type AddressSuggestion } from "@/services/address-autocomplete.service";

type AddressAutocompleteInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: EstablishmentAddress) => void;
  locale?: Locale;
};

const SEARCH_DEBOUNCE_MS = 200;

export function AddressAutocompleteInput({
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder,
  disabled,
  className,
  locale = "fr",
  ...props
}: AddressAutocompleteInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);
  const skipNextSearchRef = useRef(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const cancelSearch = useCallback(() => {
    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    setIsSearching(false);
  }, []);

  const fetchSuggestions = useCallback(
    (query: string) => {
      cancelSearch();

      if (query.trim().length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }

      const controller = new AbortController();
      searchControllerRef.current = controller;
      setIsSearching(true);

      void searchAddresses(query, locale, controller.signal, (results) => {
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setActiveIndex(-1);
      }).finally(() => {
        if (searchControllerRef.current === controller) {
          searchControllerRef.current = null;
          setIsSearching(false);
        }
      });
    },
    [cancelSearch, locale],
  );

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const timeoutId = setTimeout(() => fetchSuggestions(value), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [fetchSuggestions, value]);

  useEffect(() => cancelSearch, [cancelSearch]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    cancelSearch();
    if (suggestion.street !== value) {
      skipNextSearchRef.current = true;
    }
    onChange(suggestion.street);
    onAddressSelect?.({
      street: suggestion.street,
      zipCode: suggestion.zipCode,
      city: suggestion.city,
      country: suggestion.country,
    });
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      onBlur?.(event);
    }, 150);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0 && event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex]);
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pr-9", className)}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-busy={isSearching}
        {...props}
      />

      {isSearching ? (
        <Loader2
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : null}

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-control border border-input bg-background py-1 shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.label}-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  index === activeIndex && "bg-accent text-accent-foreground",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
