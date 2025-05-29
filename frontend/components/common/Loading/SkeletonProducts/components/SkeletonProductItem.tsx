export function SkeletonProductItem() {
   return (
      <div className="animate-pulse">
         <div className="w-full h-[303px] rounded bg-gray-border"></div>
         <div className="pt-4">
            <div>
               <div className="h-4 w-full bg-gray-border rounded"></div>
               <div className="h-4 w-8/12 bg-gray-border rounded mt-1"></div>
            </div>
            <div className="h-6 w-6/12 bg-gray-border rounded mt-2"></div>
            <div className="h-[38px] w-full bg-gray-border rounded mt-3"></div>
         </div>
      </div>
   )
}
