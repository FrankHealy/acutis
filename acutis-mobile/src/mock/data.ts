export const occupancy = {
  detox: { used: 8, capacity: 12 },
  alcohol: { used: 32, capacity: 40 },
};

export const formatPercent = (used: number, capacity: number) =>
  Math.round((used / Math.max(capacity, 1)) * 100);

