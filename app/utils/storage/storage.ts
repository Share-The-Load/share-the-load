import { createMMKV } from "react-native-mmkv"

export const mmkvStorage = createMMKV()
console.log("[mmkv] instance:", typeof mmkvStorage, mmkvStorage != null, Object.keys(mmkvStorage || {}))

export function loadString(key: string): string | null {
  try {
    return mmkvStorage.getString(key) ?? null
  } catch {
    return null
  }
}

export function saveString(key: string, value: string): boolean {
  try {
    mmkvStorage.set(key, value)
    return true
  } catch {
    return false
  }
}

export function load(key: string): unknown | null {
  try {
    const value = mmkvStorage.getString(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    mmkvStorage.set(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(key: string): void {
  try {
    mmkvStorage.remove(key)
  } catch { }
}

export function clear(): void {
  try {
    mmkvStorage.clearAll()
  } catch { }
}
