import { SignUpAuth } from '@/components/Auth'
import { AuthContainer } from '@/components/common'

export default function SignUp() {
   return (
      <AuthContainer className="py-20">
         <SignUpAuth />
      </AuthContainer>
   )
}
