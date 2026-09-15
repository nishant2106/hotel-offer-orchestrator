import type { SupplierHotel } from "./types"

const supplierAHotels: SupplierHotel[] = [
  { hotelId: "a1", name: "Holtin", price: 6000, city: "delhi", commissionPct: 10 },
  { hotelId: "a2", name: "Radison", price: 5900, city: "delhi", commissionPct: 13 },
  { hotelId: "a3", name: "Urban Nest", price: 4200, city: "delhi", commissionPct: 9 },
  { hotelId: "a4", name: "Sea Crown", price: 7200, city: "mumbai", commissionPct: 12 },
]

const supplierBHotels: SupplierHotel[] = [
  { hotelId: "b1", name: "Holtin", price: 5340, city: "delhi", commissionPct: 20 },
  { hotelId: "b2", name: "Radison", price: 6200, city: "delhi", commissionPct: 11 },
  { hotelId: "b3", name: "Metro Palace", price: 6800, city: "delhi", commissionPct: 14 },
  { hotelId: "b4", name: "Sea Crown", price: 7100, city: "mumbai", commissionPct: 18 },
]

export function getSupplierAHotels(city: string): SupplierHotel[] {
  return supplierAHotels.filter((hotel) => hotel.city.toLowerCase() === city.toLowerCase())
}

export function getSupplierBHotels(city: string): SupplierHotel[] {
  return supplierBHotels.filter((hotel) => hotel.city.toLowerCase() === city.toLowerCase())
}
