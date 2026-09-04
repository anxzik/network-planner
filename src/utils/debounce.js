// Delay a call until it stops being made.
//
// Each call restarts the timer, so a burst of calls results in a single
// invocation with the last set of arguments.
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
