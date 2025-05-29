export interface ILoadingFacebookProps {
   className?: string
}

export function LoadingFacebook({ className = '' }: ILoadingFacebookProps) {
   return (
      <div className={`d-flex ${className}`}>
         <div className={`loading-facebook`}></div>
      </div>
   )
}
