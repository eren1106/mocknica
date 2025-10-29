/**
 * Session Storage Utilities for AI Provider API Keys
 *
 * Manages temporary API keys stored in browser session storage.
 * Keys are NOT persisted to the database and only exist for the current session.
 */

import { AIProviderType } from "./types";

const SESSION_STORAGE_PREFIX = "mocknica_ai_key_";

/**
 * Get the session storage key for a provider
 */
function getStorageKey(provider: AIProviderType): string {
  return `${SESSION_STORAGE_PREFIX}${provider}`;
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

/**
 * Store an API key in session storage
 */
export function storeApiKey(provider: AIProviderType, apiKey: string): void {
  if (!isBrowser()) {
    console.warn("Session storage is not available in this environment");
    return;
  }

  try {
    sessionStorage.setItem(getStorageKey(provider), apiKey);
  } catch (error) {
    console.error(`Failed to store API key for ${provider}:`, error);
  }
}

/**
 * Retrieve an API key from session storage
 */
export function getApiKey(provider: AIProviderType): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return sessionStorage.getItem(getStorageKey(provider));
  } catch (error) {
    console.error(`Failed to retrieve API key for ${provider}:`, error);
    return null;
  }
}

/**
 * Remove an API key from session storage
 */
export function removeApiKey(provider: AIProviderType): void {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.removeItem(getStorageKey(provider));
  } catch (error) {
    console.error(`Failed to remove API key for ${provider}:`, error);
  }
}

/**
 * Clear all AI provider API keys from session storage
 */
export function clearAllApiKeys(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    Object.values(AIProviderType).forEach((provider) => {
      removeApiKey(provider);
    });
  } catch (error) {
    console.error("Failed to clear API keys:", error);
  }
}

/**
 * Check if an API key exists in session storage
 */
export function hasApiKey(provider: AIProviderType): boolean {
  return getApiKey(provider) !== null;
}

/**
 * Get all providers that have API keys stored in session
 */
export function getProvidersWithKeys(): AIProviderType[] {
  if (!isBrowser()) {
    return [];
  }

  return Object.values(AIProviderType).filter((provider) =>
    hasApiKey(provider)
  );
}
