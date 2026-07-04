export interface ListDestinationsQuery {
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  parentDestinationId?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}
