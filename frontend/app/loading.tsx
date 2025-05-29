import { Container } from '@/components/common'
import { LoadingFacebook } from '@/components/common/Loading'

export default function HomeLoading() {
   return (
      <Container className="pt-header">
         <LoadingFacebook className="pt-10" />
      </Container>
   )
}
