import { ICommonObject } from '@/models'

// Kiểm tra xem có đang ở môi trường browser không
const isBrowser = () => typeof window !== 'undefined'

export const getLs = (key: string) => {
   if (!isBrowser()) return null
   try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item)
   } catch (error) {
      console.error('Error getting from localStorage:', error)
      return null
   }
}

export const setLs = (key: string, data: ICommonObject | boolean) => {
   if (!isBrowser()) return
   try {
      localStorage.setItem(key, JSON.stringify(data))
   } catch (error) {
      console.error('Error setting to localStorage:', error)
   }
}

export const removeLs = (key: string) => {
   if (!isBrowser()) return
   try {
      localStorage.removeItem(key)
   } catch (error) {
      console.error('Error removing from localStorage:', error)
   }
}

export const removeAll = () => {
   if (!isBrowser()) return
   try {
      localStorage.clear()
   } catch (error) {
      console.error('Error clearing localStorage:', error)
   }
}
