import { createServerFn } from "@tanstack/react-start";

/**
 * Hash cache: Map<dataUri, hexHash>
 */
const hashCache = new Map<string, string>();

/**
 * Compute SHA256 hash of a string using SubtleCrypto
 */
export async function sha256(
  data: string | ArrayBuffer | Uint8Array,
): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = typeof data === "string" ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    bytes as ArrayBuffer,
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hashHex}`;
}

/**
 * Cached SHA256 computation - returns cached hash if exists
 */
export async function cachedSha256(dataUri: string): Promise<string> {
  if (hashCache.has(dataUri)) {
    return hashCache.get(dataUri)!;
  }

  const hash = await sha256(dataUri);
  hashCache.set(dataUri, hash);
  return hash;
}

/**
 * Convert bytes to base64 string manually
 */
export function bytesToBase64(bytes: Uint8Array): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];

    const bitmap = (b1 << 16) | (b2 << 8) | b3;

    result += chars[(bitmap >> 18) & 63];
    result += chars[(bitmap >> 12) & 63];
    result += i + 1 < bytes.length ? chars[(bitmap >> 6) & 63] : "=";
    result += i + 2 < bytes.length ? chars[bitmap & 63] : "=";
  }

  return result;
}

export type MoonbirdItem = {
  id: number;
  url: string;
  content_sha: string;
  content_uri: string;
};

export type MoonbirdItemResponse = {
  id: number;
  url: string;
  content_sha: string;
  content_uri: string;
  txhash: `0x${string}` | null;
};

const respCache = new Map<string, MoonbirdItem>();
export const BASE_IMAGE_URL = `https://raw.githack.com/proofxyz/moonbirds-assets/main/collection/png`;

/**
 * Fetch an image from URL and convert to data URI
 */
export async function getImage(id: number): Promise<MoonbirdItem> {
  const url = `${BASE_IMAGE_URL}/${id}.png`;
  if (respCache.has(url)) {
    const entry = respCache.get(url)!;
    return {
      id: entry.id,
      url: url,
      content_sha: entry.content_sha,
      content_uri: entry.content_uri,
    };
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());

  const dataUri = `data:image/png;base64,${bytesToBase64(bytes)}`;
  const hash = await cachedSha256(dataUri);
  const resp = {
    id: id,
    url: url,
    content_sha: hash,
    content_uri: dataUri,
  };

  respCache.set(url, resp);

  return resp;
}

const checkCache = new Map<string, any>();

export async function verifyItems(shas: `0x${string}`[]): Promise<{
  result: { [key: `0x${string}`]: `0x${string}` | null };
}> {
  const hash = await cachedSha256(JSON.stringify(shas));

  if (checkCache.has(hash)) {
    return checkCache.get(hash)!;
  }

  const resp = await fetch(
    `https://api.ethscriptions.com/v2/ethscriptions/exists_multi`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shas }),
    },
  ).then((response) => response.json());

  checkCache.set(hash, resp);

  return resp;
}

export type Traits = {
  Specie: string;
  Eyes: string;
  Eyewear: string;
  Outerwear: string;
  Headwear: string;
  Body: string;
  Feathers: string;
  Background: string;
  Beak: string;
};

export type Attributes = {
  trait_type: Lowercase<keyof Traits>;
  value: string;
};

const TRAITS_URL = `https://rawcdn.githack.com/proofxyz/moonbirds-assets/refs/heads/main/traits.json`;
const traitsCache = new Map<string, Traits[]>();

export async function getItemAttributes(
  itemIndex: number,
): Promise<Attributes[]> {
  const traitsArray = traitsCache.has(TRAITS_URL)
    ? traitsCache.get(TRAITS_URL)!
    : [];

  if (traitsArray.length === 0) {
    const response = await fetch(TRAITS_URL);
    if (!response.ok) throw new Error("Failed to fetch traits");

    const traitsArray = (await response.json()) as Traits[];
    traitsCache.set(TRAITS_URL, traitsArray);
  }

  const itemTraits = traitsArray.find((_, idx) => idx === itemIndex);
  const itemAttributes = itemTraits
    ? Object.entries(itemTraits).map(
        ([key, value]) =>
          ({
            trait_type: key.toLowerCase(),
            value,
          }) as Attributes,
      )
    : [];

  return itemAttributes;
}
export const getItemTraitsData = createServerFn({ method: "GET" })
  .inputValidator((index: number) => index)
  .handler(
    async ({ data: itemIndex }): Promise<Attributes[]> =>
      getItemAttributes(itemIndex),
  );

export async function loadMoonbirdsPage(page: number) {
  const TOTAL_ITEMS = 10_000;
  const start = page * 100;
  const end = Math.min(start + 100, TOTAL_ITEMS);

  const items: MoonbirdItem[] = await Promise.all(
    Array.from({ length: end - start }, async (_, i) => {
      const itemIndex = start + i;
      const imageData = await getImage(itemIndex);
      // const itemAttributes = await getItemAttributes(itemIndex);

      return {
        id: itemIndex,
        url: imageData.url,
        content_uri: imageData.content_uri,
        content_sha: imageData.content_sha,
        // attributes: itemAttributes,
      };
    }),
  );

  return {
    items,
    page,
    hasMore: end < TOTAL_ITEMS,
  };
}

async function loadPage(page: number): Promise<{
  items: MoonbirdItemResponse[];
  page: number;
  hasMore: boolean;
}> {
  const pageData = await loadMoonbirdsPage(page);

  // Filter out items with empty content_sha (failed fetches)
  const validItems = pageData.items.filter(
    (item) => item.content_sha && item.content_sha.length > 0,
  );

  // Verify only valid items
  let verifyResult: {
    result: { [key: `0x${string}`]: `0x${string}` | null };
  } = { result: {} };

  if (validItems.length > 0) {
    const shas = validItems.map((item) => item.content_sha as `0x${string}`);

    verifyResult = await verifyItems(shas);
  }

  // Merge txhash into each item
  const itemsWithTxHash = pageData.items.map((item) => ({
    id: item.id,
    url: item.url,
    content_sha: item.content_sha,
    content_uri: item.content_uri,
    // attributes: item.attributes,
    txhash: item.content_sha
      ? verifyResult.result[item.content_sha as `0x${string}`] || null
      : null,
  }));

  return {
    items: itemsWithTxHash,
    page: pageData.page,
    hasMore: pageData.hasMore,
  };
}
export const getMoonbirdsPage = createServerFn({ method: "GET" })
  .inputValidator((page: number) => page)
  .handler(
    async ({
      data: page,
    }): Promise<{
      items: MoonbirdItemResponse[];
      page: number;
      hasMore: boolean;
    }> => loadPage(page),
  );

// console.log("results:", await loadPage(0));
