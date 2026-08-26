import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

let client: SupabaseClient<Database> | null = null;
let initAttempted = false;

function readPublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  // Reject common placeholders so createClient doesn't throw / crash the page
  if (
    url.includes("YOUR_PROJECT") ||
    url.includes("your_url") ||
    anonKey.includes("your_supabase") ||
    anonKey === "your_key"
  ) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return readPublicConfig() !== null;
}

export function getSupabase(): SupabaseClient<Database> | null {
  if (client) return client;
  if (initAttempted) return null;
  initAttempted = true;

  const config = readPublicConfig();
  if (!config) {
    console.warn(
      "[supabase] Public env vars missing or invalid — running in offline demo mode"
    );
    return null;
  }

  client = createClient<Database>(config.url, config.anonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return client;
}

/**
 * Convenience proxy for call sites that expect a client.
 * Methods no-op / return empty results when Supabase is not configured,
 * instead of throwing and blanking the Vercel page.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const instance = getSupabase();
    if (!instance) {
      if (prop === "from") {
        return () => createOfflineQueryBuilder();
      }
      if (prop === "channel") {
        return () => createOfflineChannel();
      }
      if (prop === "removeChannel") {
        return async () => "ok";
      }
      return undefined;
    }

    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

function createOfflineQueryBuilder() {
  const result = Promise.resolve({ data: [] as never[], error: null });
  const builder: Record<string, unknown> = {};
  const passthrough = () => builder;
  builder.select = passthrough;
  builder.insert = passthrough;
  builder.update = passthrough;
  builder.delete = passthrough;
  builder.eq = passthrough;
  builder.not = passthrough;
  builder.order = passthrough;
  builder.limit = passthrough;
  builder.maybeSingle = () => result;
  builder.single = () => result;
  builder.then = result.then.bind(result);
  return builder;
}

function createOfflineChannel() {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: async () => "ok" as const,
  };
  return channel;
}
