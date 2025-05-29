import { Container } from '@/components/common'
import { FooterCopyright, FooterTop } from '@/components/common/Footer/components'

export interface IFooterProps {}

export function Footer(props: IFooterProps) {
   return (
      <footer className="w-full bg-primary-lighter pt-6">
         <Container>
            <FooterTop />
            <FooterCopyright />
         </Container>
      </footer>
   )
}
