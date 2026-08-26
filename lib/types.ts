export type Bid = {
  id: string;
  user_id: string | null;
  display_name: string;
  tagline: string;
  avatar_url: string;
  custom_color: string;
  target_url: string;
  bid_amount_pence: number;
  floor_rank: number | null;
  stripe_session_id: string | null;
  created_at: string;
};

export type BidInsert = {
  user_id?: string | null;
  display_name: string;
  tagline?: string;
  avatar_url?: string;
  custom_color?: string;
  target_url?: string;
  bid_amount_pence: number;
  stripe_session_id?: string | null;
};

export type Database = {
  public: {
    Tables: {
      bids: {
        Row: Bid;
        Insert: BidInsert;
        Update: Partial<BidInsert> & {
          floor_rank?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const TOTAL_FLOORS = 100;
export const PENTHOUSE_ZONE_MIN = 91;
export const MIN_BID_PENCE = 500;

export function formatGbpFromPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Hostname for tooltip/display, e.g. `https://www.chambers.dev/x` → `chambers.dev` */
export function urlDisplayDomain(rawUrl: string): string | null {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    return null;
  }
}
