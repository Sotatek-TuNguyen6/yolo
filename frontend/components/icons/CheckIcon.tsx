export interface ICheckIconProps {
   className?: string
}

export function CheckIcon({ className = '' }: ICheckIconProps) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         width="19"
         height="14"
         viewBox="0 0 19 14"
         fill="none"
         className={`mdl-js ${className}`}
      >
         <path
            d="M17.2185 1L6.40618 13L1 7.00027"
            stroke="#EE4D2D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   )
}
