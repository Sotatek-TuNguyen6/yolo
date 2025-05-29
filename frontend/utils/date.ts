export const formatDate = (date: Date) => {
   const date$ = new Date(date)
   const d = `0${date$.getDate()}`.slice(-2)
   const m = `0${date$.getMonth() + 1}`.slice(-2)
   const y = date$.getFullYear()

   return `${d}-${m}-${y}`
}
