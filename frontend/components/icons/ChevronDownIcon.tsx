export interface IChevronDownIconProps {
   className?: string
}

export function ChevronDownIcon({ className = '' }: IChevronDownIconProps) {
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
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
         />
      </svg>
   )
}
