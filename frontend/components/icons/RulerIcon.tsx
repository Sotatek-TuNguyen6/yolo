export interface IRulerIconProps {
   className?: string
   fill?: string
}

export function RulerIcon({ className = '', fill = 'none' }: IRulerIconProps) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         width="21"
         height="22"
         viewBox="0 0 21 22"
         fill={fill}
         className={`mdl-js text-primary-lighter ${className}`}
      >
         <path
            d="M18.7871 16.6687V4.4187C18.7871 2.6687 17.9121 1.7937 16.1621 1.7937H12.6621C10.9121 1.7937 10.0371 2.6687 10.0371 4.4187V16.6687C10.0371 18.4187 10.9121 19.2937 12.6621 19.2937H16.1621C17.9121 19.2937 18.7871 18.4187 18.7871 16.6687Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M10.0371 5.2937H14.4121"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M10.0371 15.7937H13.5371"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M10.0371 12.25L14.4121 12.2937"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M10.0371 8.7937H12.6621"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M4.80289 1.7937C3.37664 1.7937 2.21289 2.95745 2.21289 4.37495V15.715C2.21289 16.1087 2.37914 16.7037 2.58039 17.045L3.29789 18.235C4.12039 19.6087 5.47664 19.6087 6.29914 18.235L7.01664 17.045C7.21789 16.7037 7.38414 16.1087 7.38414 15.715V4.37495C7.38414 2.95745 6.22039 1.7937 4.80289 1.7937Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
         <path
            d="M7.38414 6.1687H2.21289"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
         />
      </svg>
   )
}
