import { config } from "./config"
import type { SupplierHotel, SupplierResult } from "./types"

async function fetchSupplier(path: string, supplier: SupplierResult["supplier"], city: string): Promise<SupplierResult> {
  const url = new URL(path, config.serviceBaseUrl)
  url.searchParams.set("city", city)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${supplier} returned ${response.status}`)
  }

  const hotels = (await response.json()) as SupplierHotel[]
  return { supplier, hotels }
}

export async function fetchSupplierAHotels(city: string): Promise<SupplierResult> {
  return fetchSupplier("/supplierA/hotels", "Supplier A", city)
}

export async function fetchSupplierBHotels(city: string): Promise<SupplierResult> {
  return fetchSupplier("/supplierB/hotels", "Supplier B", city)
}
