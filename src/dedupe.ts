import type { HotelOffer, SupplierResult } from "./types"

export function dedupeBestOffers(results: SupplierResult[]): HotelOffer[] {
  const bestByName = new Map<string, HotelOffer>()

  for (const result of results) {
    for (const hotel of result.hotels) {
      const normalizedName = hotel.name.trim().toLowerCase()
      const offer: HotelOffer = {
        name: hotel.name,
        price: hotel.price,
        supplier: result.supplier,
        commissionPct: hotel.commissionPct,
      }
      const current = bestByName.get(normalizedName)

      if (!current || offer.price < current.price) {
        bestByName.set(normalizedName, offer)
      }
    }
  }

  return Array.from(bestByName.values()).sort((a, b) => a.name.localeCompare(b.name))
}
