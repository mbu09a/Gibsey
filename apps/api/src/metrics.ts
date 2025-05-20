export const metrics = {
  dreamsLoggedTotal: 0,
  dreamGiftsRecent: 0,
};

export function recordDream(state: string) {
  metrics.dreamsLoggedTotal += 1;
  if (state === 'gift') {
    metrics.dreamGiftsRecent += 1;
  }
}

export function resetMetrics() {
  metrics.dreamsLoggedTotal = 0;
  metrics.dreamGiftsRecent = 0;
}
