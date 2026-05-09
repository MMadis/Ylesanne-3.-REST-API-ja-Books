export type DataSourceMode = "mock" | "prisma";

let cachedMode: DataSourceMode | undefined;

/**
 * Returns the configured data source mode (`mock` or `prisma`).
 * The value is read from `process.env.DATA_SOURCE_MODE` once and cached
 * so subsequent calls return a stable value during the process lifetime.
 */
export function getDataSourceMode(): DataSourceMode {
  if (cachedMode) return cachedMode;
  const raw = process.env.DATA_SOURCE_MODE?.toLowerCase();
  if (raw === "prisma") {
    cachedMode = "prisma";
  } else {
    cachedMode = "mock";
  }
  return cachedMode;
}

/**
 * For tests only: reset the cached mode so `getDataSourceMode()` will re-read
 * the environment variable. Use with care in test setup/teardown.
 */
export function resetDataSourceModeCache(): void {
  cachedMode = undefined;
}
