type ResizeListener = (entry: ResizeObserverEntry) => void;

const resizeListeners = new Map<Element, Set<ResizeListener>>();

let resizeObserver: ResizeObserver;

if (process.env.CLIENT) {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      for (const listener of resizeListeners.get(entry.target)!) {
        listener(entry);
      }
    }
  });
}

export function observeResize(target: Element, listener: ResizeListener) {
  let listeners = resizeListeners.get(target);

  if (listeners == null) {
    listeners = new Set();

    resizeListeners.set(target, listeners);

    resizeObserver.observe(target);
  }

  listeners.add(listener);
}

export function unobserveResize(target: Element, listener: ResizeListener) {
  const listeners = resizeListeners.get(target);

  if (listeners == null) {
    return;
  }

  listeners.delete(listener);

  if (listeners.size === 0) {
    resizeListeners.delete(target);

    resizeObserver.unobserve(target);
  }
}
