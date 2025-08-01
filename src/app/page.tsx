import Section1 from '@/components/Dashboard/layout/Section1'
import Section2 from '@/components/Dashboard/layout/Section2'
import { Spotlight } from '@/components/ui/spotlight'
import React from 'react'
function page() {
  return (
    <div className="">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="mt-8"> 
      <Section1 />
      <Section2/> 
    </div>
    </div>
  )
}

export default page