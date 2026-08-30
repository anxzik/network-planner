import {describe, expect, it} from 'vitest';
import {addItem, findById, removeItem, updateItem} from './collection';

describe('addItem', () => {
  it('appends to the end', () => {
    expect(addItem([{id: 'a'}], {id: 'b'})).toEqual([{id: 'a'}, {id: 'b'}]);
  });

  it('does not mutate the input', () => {
    const items = [{id: 'a'}];
    addItem(items, {id: 'b'});
    expect(items).toHaveLength(1);
  });
});

describe('updateItem', () => {
  it('merges updates into the matching record', () => {
    const next = updateItem([{id: 'a', name: 'old'}], 'a', {name: 'new'});
    expect(next[0].name).toBe('new');
  });

  it('stamps updatedAt as an ISO timestamp', () => {
    const next = updateItem([{id: 'a'}], 'a', {});
    expect(next[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('lets updates override existing fields but not the stamp', () => {
    const next = updateItem([{id: 'a'}], 'a', {updatedAt: 'nonsense'});
    expect(next[0].updatedAt).not.toBe('nonsense');
  });

  it('leaves other records untouched by reference', () => {
    const other = {id: 'b'};
    const next = updateItem([{id: 'a'}, other], 'a', {x: 1});
    expect(next[1]).toBe(other);
  });

  it('is a no-op when the id is absent', () => {
    const items = [{id: 'a'}];
    expect(updateItem(items, 'missing', {x: 1})).toEqual(items);
  });

  it('does not mutate the input', () => {
    const items = [{id: 'a', name: 'old'}];
    updateItem(items, 'a', {name: 'new'});
    expect(items[0].name).toBe('old');
  });
});

describe('removeItem', () => {
  it('drops only the matching record', () => {
    expect(removeItem([{id: 'a'}, {id: 'b'}], 'a')).toEqual([{id: 'b'}]);
  });

  it('is a no-op when the id is absent', () => {
    const items = [{id: 'a'}];
    expect(removeItem(items, 'zzz')).toEqual(items);
  });
});

describe('findById', () => {
  it('returns the matching record', () => {
    expect(findById([{id: 'a'}, {id: 'b'}], 'b')).toEqual({id: 'b'});
  });

  it('returns undefined when absent', () => {
    expect(findById([{id: 'a'}], 'zzz')).toBeUndefined();
  });
});
