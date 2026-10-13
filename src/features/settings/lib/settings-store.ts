"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_SETTINGS, isExperienceEffect, type Settings } from "../config";

/**
 * Tiny external store for the visitor's settings, persisted in localStorage.
 *
 * Read it with `useSettings()`. The server (and the first client render) always see the defaults,
 * so hydration matches; the saved values are picked up right after.
 */

const STORAGE_KEY = "portfolio.settings";

let current: Settings = DEFAULT_SETTINGS;
let loaded = false;
const listeners = new Set<() => void>();

/** Read the saved settings, ignoring anything missing or invalid. */
function load(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved: unknown = raw ? JSON.parse(raw) : null;
    if (saved && typeof saved === "object") {
      const { experienceEffect } = saved as Partial<Record<keyof Settings, unknown>>;
      return {
        experienceEffect: isExperienceEffect(experienceEffect)
          ? experienceEffect
          : DEFAULT_SETTINGS.experienceEffect,
      };
    }
  } catch {
    // Storage unavailable (private mode, blocked) or corrupt JSON: use the defaults.
  }
  return DEFAULT_SETTINGS;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Keep several open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = load();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Settings {
  if (!loaded) {
    current = load();
    loaded = true;
  }
  return current;
}

function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...getSnapshot(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Not persisted, but still applied for this visit.
  }
  emit();
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS);
}
