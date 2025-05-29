export interface IChevronRightIconProps {
   className?: string
}

export function ChevronRightIcon({ className = '' }: IChevronRightIconProps) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth={2}
         stroke="currentColor"
         className={`w-6 h-6 ${className}`}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
         />
      </svg>
   )
}
