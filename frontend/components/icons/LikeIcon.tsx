export interface ILikeIconProps {
   className?: string
   path?: string
}

export function LikeIcon({ className = '', path = '' }: ILikeIconProps) {
   return (
      <svg
         className={`w-6 h-6 ${className}`}
         version="1.1"
         viewBox="0 0 30 30"
         xmlSpace="preserve"
         xmlns="http://www.w3.org/2000/svg"
         xmlnsXlink="http://www.w3.org/1999/xlink"
      >
         <path
            d="M4,25h2l0,0c1.281,1.281,3.017,2,4.828,2H21l2-2v-4l0.5-10H14c0,0,1-3.266,1-4c0-2.251,0-5-3-5c-1,0-1,0-1,0l-0.501,3.491  L8.132,9.894C7.435,11.191,6.082,12,4.609,12H4V25z"
            className={`${path}`}
         ></path>
         <circle cx="23.5" cy="13.5" r="2.5"></circle>
         <circle cx="22.5" cy="21.5" r="2.5"></circle>
         <circle cx="23.5" cy="17.5" r="2.5"></circle>
         <circle cx="21" cy="25" r="2"></circle>
         <circle cx="21" cy="25" r="2"></circle>
      </svg>
   )
}
