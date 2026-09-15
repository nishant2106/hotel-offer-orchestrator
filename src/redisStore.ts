import Redis from "ioredis"
import { config } from "./config"
import type { HotelOffer, PriceFilter } from "./types"

const redis = new Redis(config.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
})

function cityKey(city: string): string {
  return city.trim().toLowerCase()
}

function offersHashKey(city: string): string {
  return `hotels:${cityKey(city)}:offers`
}

function priceSetKey(city: string): string {
  return `hotels:${cityKey(city)}:prices`
}

export async function ensureRedisConnected(): Promise<void> {
  if (redis.status === "wait") {
    await redis.connect()
  }
}

export async function saveOffersToRedis(city: string, offers: HotelOffer[]): Promise<void> {
  await ensureRedisConnected()
  const hashKey = offersHashKey(city)
  const zsetKey = priceSetKey(city)
  const pipeline = redis.pipeline()

  pipeline.del(hashKey)
  pipeline.del(zsetKey)

  for (const offer of offers) {
    const member = offer.name.trim().toLowerCase()
    pipeline.hset(hashKey, member, JSON.stringify(offer))
    pipeline.zadd(zsetKey, offer.price, member)
  }

  pipeline.expire(hashKey, 900)
  pipeline.expire(zsetKey, 900)
  await pipeline.exec()
}

export async function getOffersByPrice(city: string, filter: PriceFilter): Promise<HotelOffer[]> {
  await ensureRedisConnected()
  const min = filter.minPrice ?? "-inf"
  const max = filter.maxPrice ?? "+inf"
  const members = await redis.zrangebyscore(priceSetKey(city), min, max)

  if (members.length === 0) {
    return []
  }

  const values = await redis.hmget(offersHashKey(city), ...members)
  return values
    .filter((value): value is string => Boolean(value))
    .map((value) => JSON.parse(value) as HotelOffer)
    .sort((a, b) => a.price - b.price)
}

export async function pingRedis(): Promise<boolean> {
  try {
    await ensureRedisConnected()
    return (await redis.ping()) === "PONG"
  } catch {
    return false
  }
}

export async function closeRedis(): Promise<void> {
  redis.disconnect()
}
