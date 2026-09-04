import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {debounce} from './debounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('debounce', () => {
  it('does not call through immediately', () => {
    const fn = vi.fn();
    debounce(fn, 300)();
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls through once the delay elapses', () => {
    const fn = vi.fn();
    debounce(fn, 300)();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('coalesces a burst into a single call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes the arguments from the last call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced('first');
    debounced('second');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('restarts the timer on each call rather than firing on schedule', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('fires again for a later, separate burst', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    vi.advanceTimersByTime(300);
    debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('defaults to a 300ms delay', () => {
    const fn = vi.fn();
    debounce(fn)();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
