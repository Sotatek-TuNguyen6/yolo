import { ToastOptions, toast } from 'react-toastify'

export function useToastify() {
   return {
      error(message: string, options?: ToastOptions) {
         return toast.error(message, options || {})
      },
      success(message: string, options?: ToastOptions) {
         toast.success(message, options || {})
      },
      info(message: string, options?: ToastOptions) {
         toast.info(message, options || {})
      },
      warning(message: string, options?: ToastOptions) {
         toast.warning(message, options || {})
      },
   }
}
