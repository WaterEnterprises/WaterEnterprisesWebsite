export interface Readable<T> {
  subscribe(run: (value: T) => void): () => void;
}

export interface Writable<T> extends Readable<T> {
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

export function writable<T>(initial: T): Writable<T> {
  let value = initial;
  const subscribers = new Set<(value: T) => void>();

  return {
    set(next: T) {
      value = next;
      subscribers.forEach((run) => run(value));
    },
    update(fn: (value: T) => T) {
      this.set(fn(value));
    },
    subscribe(run: (value: T) => void) {
      subscribers.add(run);
      run(value);
      return () => {
        subscribers.delete(run);
      };
    },
  };
}

export function get<T>(store: Readable<T>): T {
  let value: T;
  const unsubscribe = store.subscribe((v) => {
    value = v;
  });
  unsubscribe();
  return value!;
}
