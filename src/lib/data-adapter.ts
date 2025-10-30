// Adapter: route Lovable UI calls to local API endpoints when USE_LOCAL_API is true
const USE_LOCAL_API = true

export async function getEvents() {
  if (USE_LOCAL_API) {
    const r = await fetch('/api/events')
    return r.json()
  }
  throw new Error('Only local API adapter implemented')
}

export async function getTimetable() {
  const r = await fetch('/api/timetable')
  return r.json()
}

export async function getNews() {
  const r = await fetch('/api/news')
  return r.json()
}

export async function getExams() {
  const r = await fetch('/api/exams')
  return r.json()
}

export async function getGermanCulture() {
  const r = await fetch('/api/german')
  return r.json()
}

export async function getMensa() {
  const r = await fetch('/api/mensa')
  return r.json()
}

export async function getItems() {
  const r = await fetch('/api/items')
  return r.json()
}

export async function createItem(text: string) {
  const r = await fetch('/api/items', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ text })})
  return r.json()
}

export async function subscribePush(payload: any) {
  const r = await fetch('/api/push/subscribe', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(payload)})
  return r.json()
}
