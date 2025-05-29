import { ReactNode } from "react"

export interface ITestLayoutProps {
   children: ReactNode
}

export default function TestLayout({ children }: ITestLayoutProps) {
   return <div>{children}</div>
}

