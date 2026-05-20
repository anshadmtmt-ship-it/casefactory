import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'casemark_phone_models';

const SEED_MODELS = [
  {
    id: 'seed-1',
    name: 'iPhone 17 Pro Max',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16pro-digitalmat-gallery-1-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aXVFMEpUeGFIdWMraFl3NlBzNHVGeHRTUjlCaFN3MjduYk5iajM4bkU2YWF6MzhZY01SdTdmdm5CMEEzdjFtMXVCYVVPSGFrNWFJMTZ0NDRucGtFamN0NUxZM3NGNlI3SXdWNVlxYmhRZ0c4cnBkZ01XMU1BUlJHbU9mdTJhS0Y',
    link: '/collections/iphone-17-pro-max',
    order: 1,
    visible: true,
  },
  {
    id: 'seed-2',
    name: 'iPhone 17 Pro',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16pro-digitalmat-gallery-2-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aXVFMEpUeGFIdWMraFl3NlBzNHVGeHRTUjlCaFN3MjduYk5iajM4bkU2YWF6MzhZY01SdTdmdm5CMEEzdjFtMXVCYVVPSGFrNWFJMTZ0NDRucGtFamN0NUxZM3NGNlI3SXdWNVlxYmhRZ0c4cnBkZ01XMU1BUlJHbU9mdTJhS0Y',
    link: '/collections/iphone-17-pro',
    order: 2,
    visible: true,
  },
  {
    id: 'seed-3',
    name: 'iPhone 17 Air',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16-digitalmat-gallery-1-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYU11ckVvZ0JiZVYzNlhFakZhVGJUd1BJK1pNM1dBY3VPdzNGSm9ucW1WYjJ2OUdvLzlIVFBvMWpRekVoSHVhVFBBR003dkdPRVFvUnFHb01mNHlFZ0s4ZkFwQXU4Sm1meEFCUHpyejFzQjE',
    link: '/collections/iphone-17-air',
    order: 3,
    visible: true,
  },
  {
    id: 'seed-4',
    name: 'iPhone 17',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16-digitalmat-gallery-2-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYU11ckVvZ0JiZVYzNlhFakZhVGJUd1BJK1pNM1dBY3VPdzNGSm9ucW1WYjJ2OUdvLzlIVFBvMWpRekVoSHVhVFBBR003dkdPRVFvUnFHb01mNHlFZ0s4ZkFwQXU4Sm1meEFCUHpyejFzQjE',
    link: '/collections/iphone-17',
    order: 4,
    visible: true,
  },
  {
    id: 'seed-5',
    name: 'iPhone 16 Pro Max',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16-digitalmat-gallery-3-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYU11ckVvZ0JiZVYzNlhFakZhVGJUd1BJK1pNM1dBY3VPdzNGSm9ucW1WYjJ2OUdvLzlIVFBvMWpRekVoSHVhVFBBR003dkdPRVFvUnFHb01mNHlFZ0s4ZkFwQXU4Sm1meEFCUHpyejFzQjE',
    link: '/collections/iphone-16-pro-max',
    order: 5,
    visible: true,
  },
  {
    id: 'seed-6',
    name: 'iPhone 16 Pro',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone16-digitalmat-gallery-4-202409?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYU11ckVvZ0JiZVYzNlhFakZhVGJUd1BJK1pNM1dBY3VPdzNGSm9ucW1WYjJ2OUdvLzlIVFBvMWpRekVoSHVhVFBBR003dkdPRVFvUnFHb01mNHlFZ0s4ZkFwQXU4Sm1meEFCUHpyejFzQjE',
    link: '/collections/iphone-16-pro',
    order: 6,
    visible: true,
  },
  {
    id: 'seed-7',
    name: 'iPhone 16 Plus',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone15-digitalmat-gallery-1-202309?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYWlxMTNBR3Y4TlYxOW9YbXQ4T2FiYjR2SEJFQXQyWjhoNHlNMFJMVW5UYnJQaDB3Sk52THNheHBkczRpNlpBZFowM0piQ3M5cnRJeHBoV1NER1BFSXQ5UnMrc3c3MkxieTdHd0w0bzg4ZXE',
    link: '/collections/iphone-16-plus',
    order: 7,
    visible: true,
  },
  {
    id: 'seed-8',
    name: 'iPhone 16',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone15-digitalmat-gallery-2-202309?wid=800&hei=1000&fmt=p-jpg&qlt=95&.v=aFJ5WFFFdEgwQit3bHY0MTVISmlSYWlxMTNBR3Y4TlYxOW9YbXQ0OGFiYjR2SEJFQXQyWjhoNHlNMFJMVW5UYnJQaDB3Sk52THNheHBkczRpNlpBZFowM0piQ3M5cnRJeHBoV1NER1BFSXQ5UnMrc3c3MkxieTdHd0w0bzg4ZXE',
    link: '/collections/iphone-16',
    order: 8,
    visible: true,
  },
  {
    id: 'seed-9',
    name: 'Samsung S25 Ultra',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2501/gallery/levant-galaxy-s25-ultra-s938-sm-s938bzthmea-thumb-544347228?$650_519_PNG$',
    link: '/collections/samsung-s25-ultra',
    order: 9,
    visible: true,
  },
  {
    id: 'seed-10',
    name: 'Samsung S25+',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2501/gallery/levant-galaxy-s25-s931-sm-s931bzkhmea-thumb-544347223?$650_519_PNG$',
    link: '/collections/samsung-s25-plus',
    order: 10,
    visible: true,
  },
];

function generateId() {
  return `model-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveToStorage(models) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch {
    // ignore storage errors
  }
}

export function usePhoneModels() {
  const [models, setModels] = useState(() => {
    const stored = loadFromStorage();
    return stored ?? SEED_MODELS;
  });

  useEffect(() => {
    saveToStorage(models);
  }, [models]);

  const addModel = useCallback((modelData) => {
    setModels((prev) => {
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((m) => m.order)) : 0;
      const newModel = {
        id: generateId(),
        name: modelData.name || 'New Model',
        image: modelData.image || '',
        link: modelData.link || '#',
        order: maxOrder + 1,
        visible: true,
      };
      return [...prev, newModel];
    });
  }, []);

  const updateModel = useCallback((id, updates) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteModel = useCallback((id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const moveModelUp = useCallback((id) => {
    setModels((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx <= 0) return prev;
      const newSorted = [...sorted];
      const tmp = newSorted[idx - 1].order;
      newSorted[idx - 1] = { ...newSorted[idx - 1], order: newSorted[idx].order };
      newSorted[idx] = { ...newSorted[idx], order: tmp };
      return newSorted;
    });
  }, []);

  const moveModelDown = useCallback((id) => {
    setModels((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((m) => m.id === id);
      if (idx < 0 || idx >= sorted.length - 1) return prev;
      const newSorted = [...sorted];
      const tmp = newSorted[idx + 1].order;
      newSorted[idx + 1] = { ...newSorted[idx + 1], order: newSorted[idx].order };
      newSorted[idx] = { ...newSorted[idx], order: tmp };
      return newSorted;
    });
  }, []);

  const toggleVisibility = useCallback((id) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m))
    );
  }, []);

  const visibleModels = [...models]
    .filter((m) => m.visible)
    .sort((a, b) => a.order - b.order);

  const allModelsSorted = [...models].sort((a, b) => a.order - b.order);

  return {
    models,
    visibleModels,
    allModelsSorted,
    addModel,
    updateModel,
    deleteModel,
    moveModelUp,
    moveModelDown,
    toggleVisibility,
  };
}
