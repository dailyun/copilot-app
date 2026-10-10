import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import stalls from '../src/data/stalls.json' with { type: 'json' };
import { searchStalls, sortStalls } from '../src/stalls.js';

describe('searchStalls', () => {
  it('searches by stall name', () => {
    const results = searchStalls(stalls, 'Ah Mei');
    assert.deepEqual(results.map((stall) => stall.name), ['Ah Mei Steam Rice']);
  });

  it('searches by cuisine case-insensitively', () => {
    const results = searchStalls(stalls, 'laksa');
    assert.deepEqual(results.map((stall) => stall.cuisine), ['Laksa']);
  });

  it('returns all stalls for an empty query', () => {
    assert.equal(searchStalls(stalls, '').length, stalls.length);
  });
});

describe('sortStalls', () => {
  it('sorts by rating descending', () => {
    const results = sortStalls(stalls, 'rating');
    assert.ok(results[0].rating >= results[1].rating);
    assert.equal(results[0].name, 'Chomp Chomp Prawn Noodles');
  });

  it('sorts by name ascending', () => {
    const results = sortStalls(stalls, 'name');
    assert.deepEqual(results.slice(0, 3).map((stall) => stall.name), [
      'Adam Road Lemak Corner',
      'Ah Mei Steam Rice',
      'Airport Road Wok House',
    ]);
  });
});
