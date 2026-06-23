declare module 'dexie' {
  export type Table<T, Key = string> = {
    add(item: T): Promise<Key>;
    put(item: T): Promise<Key>;
    update(key: Key, changes: Partial<T>): Promise<number>;
    delete(key: Key): Promise<void>;
    get(key: Key): Promise<T | undefined>;
    toArray(): Promise<T[]>;
    where(index: string): {
      equals(value: unknown): { first(): Promise<T | undefined>; toArray(): Promise<T[]> };
      aboveOrEqual(value: unknown): { reverse(): { sortBy(keyPath: string): Promise<T[]> } };
    };
    orderBy(index: string): { reverse(): { first(): Promise<T | undefined> } };
  };

  export default class Dexie {
    constructor(name: string);
    version(versionNumber: number): { stores(schema: Record<string, string>): void };
    table<T, Key = string>(name: string): Table<T, Key>;
    transaction<T>(mode: 'r' | 'rw', ...args: unknown[]): Promise<T>;
  }
}
