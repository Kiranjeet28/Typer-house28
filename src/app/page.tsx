'use client'
import Section1 from '@/components/main/layout/Section1'
import Section2 from '@/components/main/layout/Section2'
import Section3 from '@/components/main/layout/Section3'
import { Spotlight } from '@/components/ui/spotlight'
function page() {

  return (
    <div className="">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="mt-8 ">
        <Section1 />
        <div className="hidden md:block">
        <Section3 />
        </div>
        <Section2 />
      </div>


    </div>
  )
}

export default page