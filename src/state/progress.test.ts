import { describe, expect, it } from 'vitest';
import { CONTENT_VERSION } from '../content/version';
import { createStore, ensureTask, STORAGE_KEY, type StorageLike } from './progress';

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  };
}

const answerT1 = (store: ReturnType<typeof createStore>) =>
  store.update((d) => {
    const t = ensureTask(d, 'coursehub', 't1');
    t.draft.judgement = 'revise';
    t.draft.parts.reason = 'Outputs are delivered; outcomes are effects.';
  });

describe('saved progress', () => {
  it('restores answers after a reload', () => {
    const storage = memoryStorage();
    const first = createStore(storage);
    answerT1(first);
    const reloaded = createStore(storage);
    expect(reloaded.get().cases.coursehub.tasks.t1.draft.judgement).toBe('revise');
    expect(reloaded.get().seed).toBe(first.get().seed);
    expect(reloaded.notice()).toBeNull();
  });

  it('does not apply progress saved under another content version, and does not overwrite it', () => {
    const old = JSON.stringify({ contentVersion: '0.9.0', seed: 1, cases: { coursehub: { tasks: { t1: { draft: { judgement: 'approve', parts: {} } } } } } });
    const storage = memoryStorage({ [STORAGE_KEY]: old });
    const store = createStore(storage);
    expect(store.notice()).toBe('old-version');
    expect(store.get().cases).toEqual({});
    expect(store.get().contentVersion).toBe(CONTENT_VERSION);
    expect(store.oldData()).toBe(old);

    answerT1(store); // works in memory…
    expect(store.get().cases.coursehub.tasks.t1.draft.judgement).toBe('revise');
    expect(storage.data[STORAGE_KEY]).toBe(old); // …but the old data is untouched

    store.discardOldData();
    expect(store.notice()).toBeNull();
    expect(JSON.parse(storage.data[STORAGE_KEY]).contentVersion).toBe(CONTENT_VERSION);
  });

  it('works in memory when storage is unavailable or throws', () => {
    const none = createStore(null);
    expect(none.notice()).toBe('storage-unavailable');
    answerT1(none);
    expect(none.get().cases.coursehub.tasks.t1.draft.judgement).toBe('revise');

    const throwing: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    const s = createStore(throwing);
    answerT1(s);
    expect(s.get().cases.coursehub.tasks.t1.draft.judgement).toBe('revise');
    expect(() => s.reset()).not.toThrow();
  });

  it('ignores unreadable saved data', () => {
    const store = createStore(memoryStorage({ [STORAGE_KEY]: '{not json' }));
    expect(store.get().cases).toEqual({});
  });

  it('reset clears answers in memory and in storage', () => {
    const storage = memoryStorage();
    const store = createStore(storage);
    answerT1(store);
    expect(storage.data[STORAGE_KEY]).toBeDefined();
    store.reset();
    expect(store.get().cases).toEqual({});
    expect(storage.data[STORAGE_KEY]).toBeUndefined();
    expect(createStore(storage).get().cases).toEqual({});
  });
});
