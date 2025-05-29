import { contactVals } from '@/data'
import { IContactData, IContactForm, IUser } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { ContactInput } from '@/components/Contact/ContactInput'
import { Button } from '@/components/buttons'
import { connect } from 'react-redux'
import { AppState } from '@/store'
import { contactApi } from '@/api'
import { useToastify } from '@/hooks'

const schema = yup.object().shape({
   fullName: yup.string().required('Vui lòng nhập họ và tên'),
   emailAddress: yup
      .string()
      .required('Vui lòng nhập email')
      .email('Email của bạn không hợp lệ'),
   content: yup.string().required('Vui lòng nhập nội dung cần liên hệ'),
})

export interface IContactFormProps {
   pUser: IUser | null
}

function ContactForm({ pUser }: IContactFormProps) {
   const {
      handleSubmit,
      control,
      formState: { isDirty, isValid, isSubmitting },
      reset,
   } = useForm<IContactForm>({
      defaultValues: contactVals,
      resolver: yupResolver(schema),
   })
   const { error, success } = useToastify()

   const handleContactSubmit = async (values: IContactForm) => {
      try {
         const newValues: IContactData = {
            ...values,
            user: pUser?._id as string,
         }

         await contactApi.createContact(newValues)
         reset()
         success('Đã gửi liên hệ của bạn thành công')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <form onSubmit={handleSubmit(handleContactSubmit)}>
         <div>
            <div className="flex gap-4">
               <ContactInput<IContactForm>
                  name="fullName"
                  control={control}
                  label="Họ và tên"
                  required
               />
               <ContactInput<IContactForm>
                  name="emailAddress"
                  control={control}
                  label="Email"
                  required
               />
            </div>
            <ContactInput<IContactForm>
               name="content"
               control={control}
               label="Nội dung"
               required
               multiline
               rows={6}
            />
         </div>
         <div className="mt-4">
            <Button
               type="submit"
               title="Gửi liên hệ"
               className="font-medium text-sm"
               loadingClassName="!w-4 !h-4"
               disabledClassName="disabled-btn-submit"
               disabled={!isDirty || !isValid || isSubmitting}
            />
         </div>
      </form>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

export default connect(mapStateToProps, null)(ContactForm)
