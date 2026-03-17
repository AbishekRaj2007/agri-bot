import { useState, useEffect } from 'react';

const STORAGE_KEY = 'agrishield_warehouse';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingUnit = 'kg' | 'quintal' | 'ton';
export type ListingStatus = 'available' | 'sold';

export interface WarehouseListing {
  id: string;
  // Farmer identity (populated from auth at listing time)
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerState: string;
  // Crop details
  cropName: string;
  emoji: string;
  category: string;
  gradientFrom: string;
  gradientTo: string;
  // Sale details
  quantity: number;
  unit: ListingUnit;
  pricePerUnit: number;   // ₹ per unit
  minOrderQty: number;    // minimum wholesale order
  location: string;       // district / city of pickup
  description: string;
  status: ListingStatus;
  listedAt: string;       // ISO date string
}

export type NewListingData = Omit<WarehouseListing, 'id' | 'listedAt' | 'status'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pretty-prints a price with unit suffix, e.g. "₹2,100 / quintal" */
export function formatPrice(price: number, unit: ListingUnit): string {
  return `₹${price.toLocaleString('en-IN')} / ${unit}`;
}

/** Returns the total stock value of a listing */
export function totalValue(listing: WarehouseListing): number {
  return listing.quantity * listing.pricePerUnit;
}

function load(): WarehouseListing[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persist(listings: WarehouseListing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useWarehouse() {
  const [listings, setListings] = useState<WarehouseListing[]>(load);

  useEffect(() => { persist(listings); }, [listings]);

  const addListing = (data: NewListingData): WarehouseListing => {
    const newListing: WarehouseListing = {
      ...data,
      id:       Date.now().toString(),
      listedAt: new Date().toISOString().slice(0, 10),
      status:   'available',
    };
    setListings(prev => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = (id: string, data: Partial<NewListingData>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const removeListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const markAsSold = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  };

  return { listings, addListing, updateListing, removeListing, markAsSold };
}
