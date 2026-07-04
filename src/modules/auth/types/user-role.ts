/** Many-to-many join — a user can hold more than one role (e.g. SALES + RESERVATIONS) rather than being forced into exactly one. */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
}
