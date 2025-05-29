'use client'

import AxiosClient from '@/api'
import { IAddressStoreRes } from '@/models'
import { AppDispatch } from '@/store'
import { setAddress } from '@/store/common'
import axios from 'axios'
import { ReactNode, useEffect } from 'react'
import { connect } from 'react-redux'
import { SWRConfig } from 'swr'

export interface IContainerFetchAddressesProps {
   children: ReactNode
   pSetAddress: (data: IAddressStoreRes) => void
}

function ContainerFetchAddresses({
   children,
   pSetAddress,
}: IContainerFetchAddressesProps) {
   useEffect(() => {
      const getAddresses = async () => {
         try {
            const provinces = await axios
               .get(`${process.env.NEXT_PUBLIC_PROVINCE_API}/p`)
               .then((data) => data.data)
            const districts = await axios
               .get(`${process.env.NEXT_PUBLIC_PROVINCE_API}/d`)
               .then((data) => data.data)
            const wards = await axios
               .get(`${process.env.NEXT_PUBLIC_PROVINCE_API}/w`)
               .then((data) => data.data)
            const data = {
               provinces,
               districts,
               wards,
            }
            pSetAddress(data)
         } catch (error) {
            throw new Error(error as string)
         }
      }
      getAddresses()
   }, [])

   return (
      <SWRConfig
         value={{
            fetcher: (url) => AxiosClient.get(url),
            shouldRetryOnError: false,
         }}
      >
         {children}
      </SWRConfig>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pSetAddress: (data: IAddressStoreRes) => dispatch(setAddress(data)),
   }
}

export default connect(null, mapDispatchToProps)(ContainerFetchAddresses)
