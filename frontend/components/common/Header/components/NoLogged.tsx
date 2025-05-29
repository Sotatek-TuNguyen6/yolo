import Link from 'next/link'

export interface INoLoggedProps {
   className?: string
}

export function NoLogged({ className = '' }: INoLoggedProps) {
   return (
      <div className={`flex gap-2 justify-end items-center ${className}`}>
         <div>
            <Link
               href={'/login'}
               className="btn !rounded-full border border-transparent text-white font-medium"
               scroll
            >
               Đăng nhập
            </Link>
         </div>
         <div>
            <Link
               href={'/signup'}
               className="btn !rounded-full border border-secondary-dark !bg-white font-medium !text-secondary hover:!bg-secondary-dark hover:!text-white"
               scroll
            >
               Đăng ký
            </Link>
         </div>
      </div>
   )
}
