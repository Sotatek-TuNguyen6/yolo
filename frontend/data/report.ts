import { ReportType } from '@/enums'

export const reports = [
   {
      name: 'Bình luận chứa nội dung tục tĩu',
      val: ReportType.OBSCENE_CONTENT,
   },
   {
      name: 'Bình luận chứa nội dung có tính chất đe dọa',
      val: ReportType.THREATENING_CONTENT,
   },
   {
      name: 'Bình luận chứa nội dung căm thù',
      val: ReportType.HATE_SPEECH_CONTENT,
   },
   {
      name: 'Bình luận có tính chất lạm dụng, xâm phạm quyền riêng tư của người khác',
      val: ReportType.ABUSE_CONTENT,
   },
   {
      name: 'Khác',
      val: ReportType.OTHER,
   },
]
