import { ICommonObject } from '@/models'
import { SignJWT, jwtVerify } from 'jose'

export const getJwtSecretKey = () => {
   const secret = process.env.NEXT_PUBLIC_JWT_SECRET_KEY

   if (!secret) {
      throw new Error('JWT Secret key is not matched')
   }

   return new TextEncoder().encode(secret)
}

export const signJwt = async (payload: ICommonObject) => {
   const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(process.env.NEXT_PUBLIC_ONE_MONTH as string)
      .sign(getJwtSecretKey())

   return token
}

export const verifyJwt = async (token: string) => {
   const { payload } = await jwtVerify(token, getJwtSecretKey())
   return payload
}
