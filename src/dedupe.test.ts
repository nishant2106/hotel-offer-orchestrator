import assert from "node:assert/strict"
import test from "node:test"
import { dedupeBestOffers } from "./dedupe"
import type { SupplierResult } from "./types"

test("dedupeBestOffers keeps the cheapest offer for overlapping hotel names", () => {
  const results: SupplierResult[] = [
    {
      supplier: "Supplier A",
      hotels: [
        { hotelId: "a1", name: "Holtin", price: 6000, city: "delhi", commissionPct: 10 },
        { hotelId: "a2", name: "Radison", price: 5900, city: "delhi", commissionPct: 13 },
      ],
    },
    {
      supplier: "Supplier B",
      hotels: [
        { hotelId: "b1", name: "Holtin", price: 5340, city: "delhi", commissionPct: 20 },
        { hotelId: "b2", name: "Radison", price: 6200, city: "delhi", commissionPct: 11 },
      ],
    },
  ]

  assert.deepEqual(dedupeBestOffers(results), [
    { name: "Holtin", price: 5340, supplier: "Supplier B", commissionPct: 20 },
    { name: "Radison", price: 5900, supplier: "Supplier A", commissionPct: 13 },
  ])
})

test("dedupeBestOffers keeps supplier-only hotels", () => {
  const results: SupplierResult[] = [
    {
      supplier: "Supplier A",
      hotels: [{ hotelId: "a1", name: "Urban Nest", price: 4200, city: "delhi", commissionPct: 9 }],
    },
    {
      supplier: "Supplier B",
      hotels: [{ hotelId: "b1", name: "Metro Palace", price: 6800, city: "delhi", commissionPct: 14 }],
    },
  ]

  assert.deepEqual(dedupeBestOffers(results), [
    { name: "Metro Palace", price: 6800, supplier: "Supplier B", commissionPct: 14 },
    { name: "Urban Nest", price: 4200, supplier: "Supplier A", commissionPct: 9 },
  ])
})
