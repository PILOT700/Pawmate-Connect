import { logger } from "./logger";

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires an identifying User-Agent and turns away
// anonymous traffic. Only profile saves reach it, so the volume stays well
// inside what the policy allows.
const USER_AGENT = "Pawmate/1.0 (+https://pawmate-frontend-seven.vercel.app)";

const TIMEOUT_MS = 5000;

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Turns a city name into a point. Returns null on anything unexpected — an
 * unknown city, a slow reply, a service having a bad day.
 *
 * Failing soft is deliberate: someone saving their profile should not be told
 * their city is wrong because a third party did not answer. They keep the city
 * they typed, and only the distance filter is poorer for it.
 */
export async function geocodeCity(city: string): Promise<Coordinates | null> {
  const trimmed = city.trim();
  if (!trimmed) return null;

  const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn({ city: trimmed, status: response.status }, "Geocoder refused the lookup");
      return null;
    }

    const results = (await response.json()) as { lat?: string; lon?: string }[];
    const first = results[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch (err) {
    logger.warn({ city: trimmed, err }, "Geocoding failed; the profile keeps its city without a point");
    return null;
  }
}
