'use client'

import { UserInfoHeader } from '@/components/common/NavUserInfo/components'
import { navUserLinks } from '@/data'
import { IUser } from '@/models'
import { AppDispatch } from '@/store'
import { showModalLogout } from '@/store/common'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GoSignOut } from 'react-icons/go'
import { connect } from 'react-redux'

export interface INavUserInfoProps {
   user: IUser
   className?: string
   pShowModalLogout: () => void
}

function NavUserInfo({ user, className = '', pShowModalLogout }: INavUserInfoProps) {
   const pathName = usePathname()

   return (
      <aside className={`w-full ${className}`}>
         <div className="flex flex-col items-center py-8 px-6">
            <UserInfoHeader user={user} />
            <h3 className="mb-2 mt-6 font-semibold text-sapo text-sm">{user.fullName}</h3>
            <button
               className="btn gap-2 !bg-secondary hover:!bg-secondary-dark font-semibold text-white text-sm"
               onClick={pShowModalLogout}
            >
               <GoSignOut className="w-4 h-4 stroke-1" /> Đăng xuất
            </button>
         </div>
         <nav className="flex flex-col">
            <ul className="mb-3">
               {navUserLinks.map((nav) => {
                  const Icon = nav.icon
                  return (
                     <li key={nav.id}>
                        <Link
                           href={nav.link}
                           className={`flex items-center py-3 group ${
                              pathName === nav.link
                                 ? 'bg-secondary-lighter'
                                 : 'bg-transparent'
                           } hover:bg-secondary-lighter duration-common`}
                           scroll
                        >
                           <span className="pl-6 mr-3 w-[46px] inline-flex justify-center">
                              <Icon
                                 className={`group-hover:text-yellow-icon ${
                                    pathName === nav.link
                                       ? 'text-yellow-icon'
                                       : 'text-sapo'
                                 } duration-common`}
                              />
                           </span>
                           <span
                              className={`flex-1 text-sm font-medium ${
                                 pathName === nav.link
                                    ? 'text-secondary-dark'
                                    : 'text-sapo'
                              } group-hover:text-secondary-dark duration-common`}
                           >
                              {nav.name}
                           </span>
                        </Link>
                     </li>
                  )
               })}
            </ul>
         </nav>
      </aside>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pShowModalLogout: () => dispatch(showModalLogout(true)),
   }
}

export default connect(null, mapDispatchToProps)(NavUserInfo)
