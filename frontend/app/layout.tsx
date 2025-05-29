import {
   ContainerFetchAddresses,
   PhoneMobile,
   ScrollTop,
   SessionProvider,
} from '@/components/common'
import {
   ModalDelete,
   ModalLogout,
   ModalNotificationLogin,
   ModalReport,
} from '@/components/modals'
import { ReduxProvider } from '@/store/provider'
import '@/styles/globals.css'
import { Metadata } from 'next'
import { ReactNode } from 'react'
import 'react-toastify/dist/ReactToastify.min.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export const metadata: Metadata = {
   title: 'LUMEN - Mặc Mỗi Ngày, Thoải Mái Mỗi Ngày',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
   // Xử lý lỗi khi lấy session
   let session
   try {
      session = await getServerSession(authOptions)
   } catch (error) {
      console.error('Lỗi khi lấy session:', error)
      session = null
   }

   return (
      <html lang="en">
         <body className="overflow-x-hidden">
            <SessionProvider session={session}>
               <ReduxProvider>
                  <ContainerFetchAddresses>
                     <main className="min-h-screen">
                        {children}{' '}
                        <>
                           <ModalDelete />
                           <ModalLogout />
                           <PhoneMobile />
                           <ModalNotificationLogin />
                           <ModalReport />
                           <ScrollTop />
                        </>
                     </main>
                  </ContainerFetchAddresses>
               </ReduxProvider>
            </SessionProvider>
         </body>
      </html>
   )
}
