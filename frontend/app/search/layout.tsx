import { Metadata } from 'next'
import { ReactNode } from 'react'

type Props = {
   params: { q: string }
   searchParams: { [key: string]: string | string[] }
}
export async function generateMetadata(props: Props): Promise<Metadata> {
   return {
      title: 'Tìm kiếm',
   }
}

export interface ISearchLayoutProps {
   children: ReactNode
}

export default function SearchLayout({ children }: ISearchLayoutProps) {
   return <section className="pt-[108px]">{children}</section>
}
