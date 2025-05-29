export interface ILoadingSpinnerProps {
   className?: string
   loadingClassName?: string
   message: string
}

export function LoadingSpinner({
   message,
   className = '',
   loadingClassName = '',
}: ILoadingSpinnerProps) {
   return (
      <div className={`spinner ${className}`}>
         <div className="flex items-center justify-center space-x-2">
            <span
               className={`animate-spin inline-block w-7 h-7 border-[3px] border-secondary border-t-transparent text-blue-600 rounded-full ${loadingClassName}`}
            ></span>
         </div>

         <div className="mt-3 font-semibold text-primary text-sm">{message}</div>
      </div>
   )
}
