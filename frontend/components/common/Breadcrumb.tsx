import { Children, Fragment, ReactNode } from 'react'

export interface IBreadcrumbProps {
   children: ReactNode
   className?: string
}

export function Breadcrumb({ children, className = '' }: IBreadcrumbProps) {
   const items = Children.toArray(children)

   return (
      <nav className={`mt-6 mb-4 ${className}`}>
         <ol className="flex items-center">
            {items.map((item, idx) => (
               <Fragment key={idx}>
                  {idx !== 0 && <li className="mx-3 text-lg">/</li>}
                  <li className="text-sm text-black">{item}</li>
               </Fragment>
            ))}
         </ol>
      </nav>
   )
}
