import { proxyActivities } from "@temporalio/workflow"
import type * as activities from "./activities"
import { dedupeBestOffers } from "./dedupe"
import type { HotelOffer } from "./types"

const supplierActivities = proxyActivities<typeof activities>({
  startToCloseTimeout: "15 seconds",
  retry: {
    maximumAttempts: 3,
  },
})

export async function hotelOfferWorkflow(city: string): Promise<HotelOffer[]> {
  const [supplierA, supplierB] = await Promise.all([
    supplierActivities.fetchSupplierAHotels(city),
    supplierActivities.fetchSupplierBHotels(city),
  ])

  return dedupeBestOffers([supplierA, supplierB])
}
