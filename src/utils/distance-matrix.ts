import { distanceMatrix } from '@/constants/matrixfromcsv';

/**
 * DistanceMatrix utility class for looking up distances between fire stations
 */
export class DistanceMatrix {
  private matrix: Record<string, Record<string, number>>;

  constructor() {
    this.matrix = distanceMatrix;
  }

  /**
   * Get distance between two stations
   * @param from - Origin station name
   * @param to - Destination station name
   * @returns Distance string with "Km" suffix, or null if not found
   */
  getDistance(from: string, to: string): string | null {
    const fromNormalized = from.trim();
    const toNormalized = to.trim();

    if (
      !this.matrix[fromNormalized] ||
      this.matrix[fromNormalized][toNormalized] === undefined
    ) {
      return null;
    }

    const distance = this.matrix[fromNormalized][toNormalized];

    // Handle zero distances (stations with no data)
    if (distance === 0 && fromNormalized !== toNormalized) {
      return null;
    }

    return `${distance} Km`;
  }

  /**
   * Check if a station exists in the matrix
   * @param stationName - Station name to check
   * @returns true if station exists
   */
  hasStation(stationName: string): boolean {
    return stationName.trim() in this.matrix;
  }

  /**
   * Get all distances from a specific station
   * @param stationName - Station name
   * @returns Object mapping station names to distances, or null if station not found
   */
  getDistancesFrom(stationName: string): Record<string, number> | null {
    const normalized = stationName.trim();
    return this.matrix[normalized] || null;
  }

  /**
   * Find nearest stations to a given station
   * @param stationName - Station name
   * @param limit - Maximum number of results (default: 5)
   * @returns Array of [stationName, distance] tuples, sorted by distance
   */
  getNearestStations(
    stationName: string,
    limit: number = 5,
  ): [string, number][] {
    const distances = this.getDistancesFrom(stationName);
    if (!distances) return [];

    return Object.entries(distances)
      .filter(([name, dist]) => name !== stationName && dist > 0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, limit);
  }
}
