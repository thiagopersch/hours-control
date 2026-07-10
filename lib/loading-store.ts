type Listener = () => void

let activeRequests = 0
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function beginRequest() {
  activeRequests += 1
  emit()
}

export function endRequest() {
  activeRequests = Math.max(0, activeRequests - 1)
  emit()
}

export function getActiveRequests() {
  return activeRequests
}

export function subscribeRequests(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
