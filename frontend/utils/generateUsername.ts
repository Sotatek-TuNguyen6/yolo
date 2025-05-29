export const generateUsername = (name: string) => {
   const wordNameList = name.split(' ')
   const capitalizeNames = wordNameList
      .slice(1)
      .map((x) => `${x[0].toUpperCase()}${x.slice(1).toLowerCase()}`)
      .join('')
   return `${wordNameList[0]}${capitalizeNames}`
}
