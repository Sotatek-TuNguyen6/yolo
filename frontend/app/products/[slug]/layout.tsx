import { Metadata } from 'next'
import { ReactNode } from 'react'

type Props = {
   params: { slug: string }
   searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const slug = params.slug
   const res = await fetch(`http://localhost:4000/api/v1/products/${slug}`).then((res) =>
      res.json()
   )
   const product = res.data && res.data.product ? res.data.product : res

   return {
      title: product.name || product.message,
      description: product.content || product.message,
   }
}
export interface IGoodDetailLayoutProps {
   children: ReactNode
}

export default function GoodDetailLayout({ children }: IGoodDetailLayoutProps) {
   return <section className="min-h-screen">{children}</section>
}
