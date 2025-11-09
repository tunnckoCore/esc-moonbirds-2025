/**
 * Verification cache: Map<0xHash, txHash | null>
 */
const verificationCache = new Map<string, string | null>();

/**
 * Get cached verification results
 */
export function getVerificationCache(hashes: string[]): {
	cached: Record<string, string | null>;
	uncached: string[];
} {
	const cached: Record<string, string | null> = {};
	const uncached: string[] = [];

	hashes.forEach((hash) => {
		if (verificationCache.has(hash)) {
			cached[hash] = verificationCache.get(hash) ?? null;
		} else {
			uncached.push(hash);
		}
	});

	return { cached, uncached };
}

/**
 * Store verification results in cache
 */
export function setVerificationCache(
	results: Record<string, string | null>,
): void {
	Object.entries(results).forEach(([hash, result]) => {
		verificationCache.set(hash, result);
	});
}

/**
 * Clear verification cache
 */
export function clearVerificationCache(): void {
	verificationCache.clear();
}
