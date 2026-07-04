export interface RequestMeta {
  ipAddress: string | null;
  deviceInfo: string | null;
}

export interface ListUsersQuery {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
