export interface CustomerNote {
  id: string;
  userId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
}
