import { ReportType } from '@/enums'
import { BaseDate, IComment, IUser } from '@/models'

export interface IReportData {
   _id?: string
   id?: string
   user: string | IUser
   comment: string | IComment
   content: string
}

export type IReport = BaseDate & {
   id: string
   _id: string
}

export type IReportType =
   | ReportType.ABUSE_CONTENT
   | ReportType.HARASSMENT_CONTENT
   | ReportType.HATE_SPEECH_CONTENT
   | ReportType.OBSCENE_CONTENT
   | ReportType.THREATENING_CONTENT
   | ReportType.OTHER

export interface IReportForm {
   type: IReportType
   content: string
}
