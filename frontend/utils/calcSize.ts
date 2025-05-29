export const checkRangeValue = (min: number, max: number, value: number) => {
   if (value >= min && value <= max) return true
   return false
}
