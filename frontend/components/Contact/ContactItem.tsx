import { ReactNode } from 'react'

export interface IContactItemProps {
   childrenIcon: ReactNode
   title: string
   description: string
   href: string
}

export function ContactItem({
   childrenIcon,
   title,
   description,
   href,
}: IContactItemProps) {
   return (
      <div className="bg-cart-dark rounded px-3 py-4 flex items-center gap-2">
         <div className="w-10 h-10 rounded-full bg-secondary-dark text-white d-flex">
            {childrenIcon}
         </div>
         <div>
            <h4 className="text-sapo text-sm font-semibold mb-0.5">{title}</h4>
            <p className="text-sapo text-sm">
               <a href={href} className="hover:text-secondary-dark duration-common">
                  {description}
               </a>
            </p>
         </div>
      </div>
   )
}
