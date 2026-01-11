export type Cat = { id: string; url: string };

/**
 * Fetches a list of random cats from the CATAAS API.
 * * @param limit - The number of cats to return (default: 10).
 * @returns A promise that resolves to an array of Cat objects containing IDs and URLs.
 * * @example
 * const cats = await getCats(5);
 * * @note
 * Uses an undocumented 'skip' parameter to achieve randomness.
 * Includes a fallback to the first page if the random skip returns no results.
 */
export async function getCats(limit: number = 10): Promise<Cat[]> {
  // Get a random 'skip' value to shuffle results
  const seed = Math.floor(Math.random() * 1000);
  console.log(`[Seed] Using skip value: ${seed}`);

  const url = `https://cataas.com/api/cats?limit=${limit}&skip=${seed}`;
  console.log(`[Fetch] Requesting cats from: ${url}`);

  const response = await fetch(url, {
    // Tells Next.js to ignore the cache and actually hit the internet every time refreshed
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      `[Fetch Error] Status: ${response.status} - ${response.statusText}`
    );
    throw new Error("Failed to fetch cats");
  }

  let data = await response.json();
  console.log(`[API Response] Received ${data.length} cats`);
  console.log(data);

  // If the API returns nothing, fallback to a basic fetch
  if (data.length === 0) {
    console.warn(
      `[API Warning] No cats found at skip ${seed}. Using fallback...`
    );

    const fallback = await fetch(`https://cataas.com/api/cats?limit=${limit}`);
    data = await fallback.json();

    console.log(`[Fallback] Successfully fetched ${data.length} fallback cats`);
    console.log(data);
  }

  console.log(`[Success] Returning ${data.length} mapped cat objects`);
  return data
    .filter((cat: { id:string }) => cat.id)
    .map((cat: { id:string }) => ({
      id: String(cat.id),
      url: `https://cataas.com/cat/${cat.id}`,
    }));
}
