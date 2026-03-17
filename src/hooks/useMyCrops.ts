import { useState, useCallback } from 'react';

export interface UserCrop {
  id: string;
  cropName: string;
  emoji: string;
  category: string;
  fieldSize: number;
  plantingDate: string;       // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  actualHarvestDate?: string;
  status: 'planted' | 'growing' | 'ready' | 'harvested';
  notes: string;
  gradientFrom: string;
  gradientTo: string;
}

const KEY = 'agrishield_my_crops';

const load = (): UserCrop[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

const persist = (crops: UserCrop[]) => localStorage.setItem(KEY, JSON.stringify(crops));

export function computeStatus(crop: UserCrop): UserCrop['status'] {
  if (crop.status === 'harvested') return 'harvested';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const harvest = new Date(crop.expectedHarvestDate);
  if (today >= harvest) return 'ready';
  const planting = new Date(crop.plantingDate);
  const total = (harvest.getTime() - planting.getTime()) / 86400000;
  const elapsed = (today.getTime() - planting.getTime()) / 86400000;
  return elapsed / total >= 0.1 ? 'growing' : 'planted';
}

export function getProgress(crop: UserCrop): number {
  if (crop.status === 'harvested') return 100;
  const today = new Date();
  const planting = new Date(crop.plantingDate);
  const harvest = new Date(crop.expectedHarvestDate);
  const total = (harvest.getTime() - planting.getTime()) / 86400000;
  const elapsed = (today.getTime() - planting.getTime()) / 86400000;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function getDaysToHarvest(crop: UserCrop): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const harvest = new Date(crop.expectedHarvestDate);
  return Math.round((harvest.getTime() - today.getTime()) / 86400000);
}

export function useMyCrops() {
  const [crops, setCrops] = useState<UserCrop[]>(load);

  const addCrop = useCallback((data: Omit<UserCrop, 'id' | 'status'>) => {
    setCrops(prev => {
      const next = [...prev, { ...data, id: Date.now().toString(), status: 'planted' as const }];
      persist(next);
      return next;
    });
  }, []);

  const updateCrop = useCallback((id: string, updates: Partial<Omit<UserCrop, 'id'>>) => {
    setCrops(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      persist(next);
      return next;
    });
  }, []);

  const deleteCrop = useCallback((id: string) => {
    setCrops(prev => {
      const next = prev.filter(c => c.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const markHarvested = useCallback((id: string) => {
    updateCrop(id, {
      status: 'harvested',
      actualHarvestDate: new Date().toISOString().slice(0, 10),
    });
  }, [updateCrop]);

  return { crops, addCrop, updateCrop, deleteCrop, markHarvested };
}
