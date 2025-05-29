import { Badge } from '@/components/common'
import { UserAvatar } from '@/components/common/Header/components'
import { SearchIcon } from '@/components/icons'
import { IUser } from '@/models'
import { AppState } from '@/store'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { BiCartAlt } from 'react-icons/bi'
import { connect } from 'react-redux'

export interface ILoggedProps {
   className?: string
   user: IUser
   pTotalCart: number
}

function Logged({ className = '', user, pTotalCart }: ILoggedProps) {
   const [search, setSearch] = useState<string>('')
   const [activeCart, setActiveCart] = useState<boolean>(false)
   const router = useRouter()
   const pathname = usePathname()

   useEffect(() => {
      setActiveCart(pathname === '/cart' ? true : false)
   }, [pathname, router])

   const handleNavigateCart = () => {
      router.push('/cart')
   }

   const handleSearchNav = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setSearch('')
      router.push(`/search?q=${search}`)
   }

   return (
      <div className={`flex items-center gap-4 ${className}`}>
         <div className="w-64">
            <form className="relative" onSubmit={handleSearchNav}>
               <input
                  type="search"
                  id="search"
                  className="block w-full py-2.5 pr-4 pl-3 text-sm text-description font-medium border border-transparent rounded focus:ring-secondary focus:border-secondary"
                  placeholder="Tìm kiếm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  required
               />
               <button
                  type="submit"
                  className="absolute cursor-pointer my-1 mr-1 inset-y-0 right-0 flex items-center px-3 bg-transparent rounded bg-white text-primary-light hover:text-primary duration-common"
               >
                  <SearchIcon />
               </button>
            </form>
         </div>
         <div className="flex gap-4 items-center">
            <Badge
               icon={<BiCartAlt className="w-6 h-6" />}
               quantities={pTotalCart}
               className={`bg-white border w-10 h-10 text-secondary-dark ${
                  activeCart ? 'border-secondary' : 'border-transparent'
               } duration-common`}
               onClick={handleNavigateCart}
            />
            <UserAvatar user={user} />
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pTotalCart: state.cart.total,
   }
}

export default connect(mapStateToProps, null)(Logged)
