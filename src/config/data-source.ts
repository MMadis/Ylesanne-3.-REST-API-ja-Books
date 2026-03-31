export type DataSourceMode = "mock" | "prisma";

export function getDataSourceMode(): DataSourceMode {
  const raw = process.env.DATA_SOURCE_MODE?.toLowerCase();
  if (raw === "prisma") {
    return "prisma";
  }
  return "mock";
}
