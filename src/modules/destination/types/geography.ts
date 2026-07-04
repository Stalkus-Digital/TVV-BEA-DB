/**
 * Country/State/Region/City/Airport are simple, structurally-similar
 * reference-data entities, deliberately consolidated into one file rather
 * than five near-identical ones — a scope decision, not a shortcut (see
 * docs/06_DESTINATION_ENGINE.md). Each is still its own typed entity with
 * its own repository and validator.
 */

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  countryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** A flexible marketing/grouping region — distinct from an administrative State, may span states or omit a country entirely. */
export interface Region {
  id: string;
  name: string;
  countryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  countryId: string;
  stateId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Airport {
  id: string;
  cityId: string;
  iataCode: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
