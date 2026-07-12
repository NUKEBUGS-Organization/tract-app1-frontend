import { baseApi } from "./baseApi";

export type AddressSuggestion = {
  place_id: string;
  description: string;
  main_text: string | null;
  secondary_text: string | null;
};

export type PropertyLookupResult = {
  address: string;
  zip_code: string | null;
  state_code: string | null;
  year_built: number | null;
  property_type: "sfh" | "multi_family" | "land" | null;
  zoning: string | null;
  unit_count: number | null;
  suggested_price: number | null;

  bedrooms: number | null;
  bathrooms: number | null;
  square_footage: number | null;
  lot_size_acres: number | null;
  latitude: number | null;
  longitude: number | null;
  county_fips: string | null;
  apn: string | null;
  last_sale_price: number | null;
  last_sale_date: string | null;

  source: "attom";
};

type SearchAddressQuery = {
  query: string;
  session_token?: string;
};

type SelectAddressQuery = {
  place_id: string;
  session_token?: string;
};

type LookupAddressQuery = {
  address1: string;
  address2: string;
};

function isNumericKeyObject(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((key) => /^\d+$/.test(key));
}

function numericKeyObjectToArray(value: any) {
  return Object.keys(value)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .filter(Boolean);
}

function unwrapApiResponse(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function normalizeAddressSuggestions(response: any): AddressSuggestion[] {
  const payload = unwrapApiResponse(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (isNumericKeyObject(payload)) {
    return numericKeyObjectToArray(payload);
  }

  if (isNumericKeyObject(payload?.data)) {
    return numericKeyObjectToArray(payload.data);
  }

  return [];
}

function normalizeLookupResult(response: any): PropertyLookupResult {
  return unwrapApiResponse(response);
}

export const propertyDataService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchPropertyAddresses: builder.query<
      AddressSuggestion[],
      SearchAddressQuery
    >({
      query: ({ query, session_token }) => ({
        url: "property-data/search",
        method: "GET",
        params: {
          query,
          ...(session_token ? { session_token } : {}),
        },
      }),
      transformResponse: normalizeAddressSuggestions,
    }),

    selectPropertyAddress: builder.query<
      PropertyLookupResult,
      SelectAddressQuery
    >({
      query: ({ place_id, session_token }) => ({
        url: "property-data/select",
        method: "GET",
        params: {
          place_id,
          ...(session_token ? { session_token } : {}),
        },
      }),
      transformResponse: normalizeLookupResult,
    }),

    lookupPropertyByAddress: builder.query<
      PropertyLookupResult,
      LookupAddressQuery
    >({
      query: ({ address1, address2 }) => ({
        url: "property-data/lookup",
        method: "GET",
        params: {
          address1,
          address2,
        },
      }),
      transformResponse: normalizeLookupResult,
    }),
  }),
});

export const {
  useLazySearchPropertyAddressesQuery,
  useLazySelectPropertyAddressQuery,
  useLazyLookupPropertyByAddressQuery,
} = propertyDataService;