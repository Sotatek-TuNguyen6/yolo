import { ChevronDownIcon } from '@/components/icons'
import { navUserLinks } from '@/data'
import { IUser } from '@/models'
import { AppDispatch } from '@/store'
import { showModalLogout } from '@/store/common'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GoSignOut } from 'react-icons/go'
import { connect } from 'react-redux'

export interface IUserAvatarProps {
   user: IUser
   pShowModalLogout: (isShow: boolean) => void
}

function UserAvatar({ user, pShowModalLogout }: IUserAvatarProps) {
   const [show, setShow] = useState<boolean>(false)
   const pathname = usePathname()

   useEffect(() => {
      setShow(false)
   }, [pathname])

   const handleShow = () => {
      setShow((prev) => !prev)
   }

   const handleShowModalLogout = () => {
      handleShow()
      pShowModalLogout(true)
   }

   return (
      <div className="relative inline-block max-h-10">
         <div
            className={`${
               show ? 'fixed top-0 left-0 w-full h-full block z-30' : 'hidden'
            }`}
            onClick={handleShow}
         ></div>
         <div
            className={`inline-flex text-sm border hover:border-secondary hover:text-secondary font-semibold items-center gap-2 relative bg-white cursor-pointer duration-common px-5 py-2 rounded-full z-50 ${
               show
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-gray-darker'
            }`}
            onClick={handleShow}
         >
            Tôi <ChevronDownIcon className="!w-4 !h-4 !text-gray-dark" />
         </div>
         <div
            className={`absolute z-40 shadow-default left-1/2 -translate-x-1/2 min-w-[170px] max-w-[200px] bg-white rounded ${
               show
                  ? 'opacity-100 pointer-events-auto top-12'
                  : 'opacity-0 pointer-events-none top-14'
            } duration-common`}
         >
            <ul className="my-2 mx-3">
               <li className="border-b border-gray-border mb-2">
                  <Link
                     href={'/'}
                     className="block font-semibold text-sm py-2 px-1.5 whitespace-nowrap text-secondary-dark"
                     scroll
                  >
                     {user.fullName}
                  </Link>
               </li>
               {navUserLinks.map((nav) => (
                  <li key={nav.id}>
                     <Link
                        href={nav.link}
                        className="block text-sm font-medium pt-1 pb-2 whitespace-nowrap text-sapo hover:text-secondary-dark duration-common"
                        scroll
                     >
                        {nav.name}
                     </Link>
                  </li>
               ))}
               <li
                  className="border-t border-gray-border mt-1 pt-2"
                  onClick={handleShowModalLogout}
               >
                  <div className="flex gap-2 group items-center cursor-pointer font-semibold text-sm py-2 px-1.5 text-center whitespace-nowrap text-red-500 bg-red-100 rounded">
                     <GoSignOut className="w-5 h-5 stroke-0.5" />{' '}
                     <span className="group-hover:text-red-700 duration-common">
                        Đăng xuất
                     </span>
                  </div>
               </li>
            </ul>
         </div>
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pShowModalLogout: (isShow: boolean) => dispatch(showModalLogout(isShow)),
   }
}

export default connect(null, mapDispatchToProps)(UserAvatar)
