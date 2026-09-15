export const config = {
  port: Number(process.env.PORT ?? 3000),
  serviceBaseUrl: process.env.SERVICE_BASE_URL ?? "http://localhost:3000",
  temporalAddress: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  temporalNamespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "hotel-offers",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
}
