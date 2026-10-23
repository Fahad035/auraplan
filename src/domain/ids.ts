/** Default id generator; injected in tests for deterministic output. */
export const randomId = (): string => crypto.randomUUID();
