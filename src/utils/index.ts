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

export function compareString(a: string, b: string) {
  if (a < b) {
    return -1
  } else if (a > b) {
    return 1
  } else {
    return 0
  }
}

export const host = import.meta.env.VITE_API_HOST
