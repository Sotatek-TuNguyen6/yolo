import { Gender } from '@/enums'
import { ICommonObject } from '@/models'

export const genderSelects: ICommonObject[] = [
   {
      name: 'Nam',
      value: Gender.MALE,
   },
   {
      name: 'Nữ',
      value: Gender.FEMALE,
   },
   {
      name: 'Khác',
      value: Gender.OTHER,
   },
]
