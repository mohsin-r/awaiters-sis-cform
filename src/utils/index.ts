export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    // @ts-expect-error TS being dumb
    return parts.pop().split(';').shift()
  }
}

export const host = 'http://localhost:5000/api'
