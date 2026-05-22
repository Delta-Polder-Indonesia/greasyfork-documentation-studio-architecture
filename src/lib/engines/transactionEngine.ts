interface TransactionPayload<T> {
  value: T;
  transactionId: string;
}

interface TransactionScheduler {
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
}

interface TransactionEngineOptions<T> {
  debounceMs?: number;
  onCommit: (payload: TransactionPayload<T>) => void;
  scheduler?: TransactionScheduler;
  idFactory?: () => string;
}

let txCounter = 0;

function createTransactionId() {
  txCounter += 1;
  return `tx_${Date.now()}_${txCounter.toString(36)}`;
}

const defaultScheduler: TransactionScheduler = {
  setTimeout: (callback, delay) => window.setTimeout(callback, delay),
  clearTimeout: (id) => window.clearTimeout(id),
};

export function createTransactionEngine<T>({ debounceMs = 240, onCommit, scheduler = defaultScheduler, idFactory = createTransactionId }: TransactionEngineOptions<T>) {
  let timer: number | null = null;
  let pendingValue: T | null = null;
  let transactionId: string | null = null;

  const flush = () => {
    if (pendingValue === null || !transactionId) return;
    onCommit({ value: pendingValue, transactionId });
    pendingValue = null;
    transactionId = null;
    if (timer) {
      scheduler.clearTimeout(timer);
      timer = null;
    }
  };

  const queue = (value: T) => {
    pendingValue = value;
    if (!transactionId) {
      transactionId = idFactory();
    }
    if (timer) {
      scheduler.clearTimeout(timer);
    }
    timer = scheduler.setTimeout(flush, debounceMs);
  };

  const cancel = () => {
    if (timer) {
      scheduler.clearTimeout(timer);
      timer = null;
    }
    pendingValue = null;
    transactionId = null;
  };

  return {
    queue,
    flush,
    cancel,
  };
}
