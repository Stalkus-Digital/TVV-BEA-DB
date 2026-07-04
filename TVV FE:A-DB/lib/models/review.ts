export interface Review {
  id?: string;
  name: string;
  location?: string;
  date: string;
  rating: number;
  title: string;
  body: string;
  tour?: string;
  /** True if review came from a verified booking source. */
  verified?: boolean;
  avatarUrl?: string;
}
