export function createSeededRandom(seed = 123456) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

export function deterministicIdFactory(seed = 42) {
  const nextRandom = createSeededRandom(seed);
  let index = 0;
  return () => {
    index += 1;
    const random = Math.floor(nextRandom() * 1_000_000)
      .toString(36)
      .padStart(4, "0");
    return `tx_det_${index}_${random}`;
  };
}

export function createManualScheduler() {
  let nextId = 1;
  const queue = new Map<number, () => void>();

  return {
    scheduler: {
      setTimeout(callback: () => void) {
        const id = nextId;
        nextId += 1;
        queue.set(id, callback);
        return id;
      },
      clearTimeout(id: number) {
        queue.delete(id);
      },
    },
    flushAll() {
      for (const [id, callback] of queue) {
        queue.delete(id);
        callback();
      }
    },
  };
}
