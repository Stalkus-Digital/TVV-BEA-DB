import type { User } from "../types/user";

export type PublicUser = Omit<User, "passwordHash">;

/** Strips passwordHash before a User ever reaches an API response — every handler that returns a User must go through this, never the raw entity. */
export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
