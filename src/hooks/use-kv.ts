import { useState, useEffect, useCallback } from 'react'

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial value from KV store
  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await spark.kv.get<T>(key)
        if (stored !== undefined) {
          setValue(stored)
        }
      } catch (error) {
        console.warn(`Failed to load KV value for key "${key}":`, error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadValue()
  }, [key])

  // Set value and persist to KV store
  const setPersistedValue = useCallback(async (newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue

      // Persist to KV store asynchronously
      spark.kv.set(key, resolvedValue).catch(error => {
        console.warn(`Failed to persist KV value for key "${key}":`, error)
      })

      return resolvedValue
    })
  }, [key])

  // Delete value from KV store
  const deleteValue = useCallback(async () => {
    try {
      await spark.kv.delete(key)
      setValue(defaultValue)
    } catch (error) {
      console.warn(`Failed to delete KV value for key "${key}":`, error)
    }
  }, [key, defaultValue])

  return [value, setPersistedValue, deleteValue]
}