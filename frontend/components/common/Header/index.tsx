'use client'

import { Container } from '@/components/common'
import { Logged, NoLogged } from '@/components/common/Header/components'
import { Logo } from '@/components/icons'
import { ICategory, IUser } from '@/models'
import { AppState } from '@/store'
import Link from 'next/link'
import { connect } from 'react-redux'

export interface IHeaderProps {
   pUser: IUser | null
   pCategories: ICategory[]
}

const variants = `h-[68px]`
function Header({ pUser, pCategories }: IHeaderProps) {
   return (
      <header
         className={`w-full fixed top-0 left-0 shadow-header z-30 bg-white ${variants} bg-header`}
      >
         <Container className="h-full">
            <div className="grid grid-cols-[100px_2fr_1fr] py-3 items-center w-full h-full">
               <Link href={'/'} scroll>
                  <Logo />
               </Link>
               <nav className="px-6">
                  <ul className="d-flex gap-10">
                     {pCategories?.map((nav) => (
                        <li key={nav._id}>
                           <Link
                              href={`/products?categories=${nav._id}&page=1`}
                              className="nav-link font-medium p-2 uppercase text-sm"
                              scroll
                           >
                              {nav.name}
                           </Link>
                        </li>
                     ))}
                     <li>
                        <Link
                           href={`/contact`}
                           className="nav-link font-medium p-2 uppercase text-sm"
                           scroll
                        >
                           Liên hệ
                        </Link>
                     </li>
                  </ul>
               </nav>
               {pUser ? <Logged user={pUser} /> : <NoLogged />}
            </div>
         </Container>
      </header>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
      pCategories: state.category.categories,
   }
}

export default connect(mapStateToProps, null)(Header)
