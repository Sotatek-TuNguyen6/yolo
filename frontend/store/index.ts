import rootReducers from '@/store/rootReducers'
import { configureStore } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const createNoopStorage = () => {
   return {
      getItem(_key: string) {
         return Promise.resolve(null)
      },
      setItem(_key: string, value: any) {
         return Promise.resolve(value)
      },
      removeItem(_key: string) {
         return Promise.resolve()
      },
   }
}

const storage =
   typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

const persistConfig = {
   key: 'root',
   storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducers)

export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false,
      }),
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
