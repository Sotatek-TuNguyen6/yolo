'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { store } from '.'
import { Footer, Header } from '@/components/common'
import { ToastContainer } from 'react-toastify'
import { PersistGate } from 'redux-persist/lib/integration/react'

export interface IReduxProviderProps {
   children: ReactNode
}

const persistor = persistStore(store)

export function ReduxProvider({ children }: IReduxProviderProps) {
   return (
      <Provider store={store}>
         <ToastContainer
            position="top-center"
            hideProgressBar
            autoClose={2000}
            theme="light"
            pauseOnFocusLoss
         />
         <PersistGate loading={null} persistor={persistor}>
            <Header />
            {children}
            <Footer />
         </PersistGate>
      </Provider>
   )
}
