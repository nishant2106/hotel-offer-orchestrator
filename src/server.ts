import express from "express"
import pinoHttp from "pino-http"
import { randomUUID } from "node:crypto"
import { config } from "./config"
import { getSupplierAHotels, getSupplierBHotels } from "./hotelData"
import { logger } from "./logger"
import { getOffersByPrice, pingRedis, saveOffersToRedis } from "./redisStore"
import { getTemporalClient } from "./temporalClient"
import { hotelOfferWorkflow } from "./workflows"

const app = express()

app.use(express.json())
app.use(pinoHttp({ logger }))

function parsePrice(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative number`)
  }
  return parsed
}

function requiredCity(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("city is required")
  }
  return value.trim()
}

app.get("/supplierA/hotels", (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : ""
  res.json(getSupplierAHotels(city))
})

app.get("/supplierB/hotels", (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : ""
  res.json(getSupplierBHotels(city))
})

app.get("/api/hotels", async (req, res, next) => {
  try {
    const city = requiredCity(req.query.city)
    const minPrice = parsePrice(req.query.minPrice, "minPrice")
    const maxPrice = parsePrice(req.query.maxPrice, "maxPrice")

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      res.status(400).json({ error: "minPrice must be less than or equal to maxPrice" })
      return
    }

    const temporal = await getTemporalClient()
    const offers = await temporal.workflow.execute(hotelOfferWorkflow, {
      taskQueue: config.taskQueue,
      workflowId: `hotel-offers-${city.toLowerCase()}-${randomUUID()}`,
      args: [city],
    })

    await saveOffersToRedis(city, offers)

    if (minPrice !== undefined || maxPrice !== undefined) {
      res.json(await getOffersByPrice(city, { minPrice, maxPrice }))
      return
    }

    res.json(offers)
  } catch (error) {
    next(error)
  }
})

app.get("/health", async (_req, res) => {
  const [supplierA, supplierB, redis] = await Promise.all([
    fetch(`${config.serviceBaseUrl}/supplierA/hotels?city=delhi`).then((response) => response.ok).catch(() => false),
    fetch(`${config.serviceBaseUrl}/supplierB/hotels?city=delhi`).then((response) => response.ok).catch(() => false),
    pingRedis(),
  ])

  const healthy = supplierA && supplierB && redis
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    suppliers: {
      supplierA,
      supplierB,
    },
    redis,
  })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected error"
  logger.error({ error }, "Request failed")
  res.status(message.includes("required") || message.includes("must") ? 400 : 500).json({ error: message })
})

app.listen(config.port, () => {
  logger.info({ port: config.port }, "API server started")
})
