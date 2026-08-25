import type { TeacherAIProvider } from "@/types";
import { deterministicProvider } from "./deterministic";
import { useSettings } from "@/store/settings";

/**
 * Provider registry (spec §12, §60). The deterministic engine is always
 * available so the core app works with no AI. Remote providers (OpenAI /
 * Anthropic / Gemini / local) can be registered here later behind the same
 * interface; until then they gracefully fall back to the built-in engine.
 *
 * Secrets note (spec §34, §79): in a hosted deployment, remote calls must be
 * proxied server-side so keys never ship to the client. In this local-first
 * build the key is stored only in the user's browser and used from Settings.
 */
const REGISTRY: Record<string, TeacherAIProvider> = {
  deterministic: deterministicProvider,
};

export function registerProvider(p: TeacherAIProvider) {
  REGISTRY[p.id] = p;
}

/** Resolve the active provider based on settings, falling back safely. */
export function getActiveProvider(): TeacherAIProvider {
  const { aiProvider } = useSettings.getState();
  if (aiProvider === "off") return deterministicProvider;
  return REGISTRY[aiProvider] ?? deterministicProvider;
}

export { deterministicProvider };
