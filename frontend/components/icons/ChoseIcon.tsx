export interface IChoseIconProps {
   className?: string
}

export function ChoseIcon({ className = '' }: IChoseIconProps) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         width="22"
         height="22"
         viewBox="0 0 22 22"
         fill="none"
         className={`mdl-js ${className}`}
      >
         <path d="M0 0H18C20.2091 0 22 1.79086 22 4V22L11 11L0 0Z" fill="#EE4D2D" />
         <path
            d="M13.4285 3L19 8.57149L18.5715 9L13 3.42851L13.4285 3Z"
            fill="white"
            stroke="white"
            strokeWidth="0.25"
         />
         <path
            d="M18.5715 3L13 8.57149L13.4285 9L19 3.42851L18.5715 3Z"
            fill="white"
            stroke="white"
            strokeWidth="0.25"
         />
      </svg>
   )
}
