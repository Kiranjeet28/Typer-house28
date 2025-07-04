import Section1 from '@/components/Dashboard/layout/Section1'
import Section2 from '@/components/Dashboard/layout/Section2'
import { NavbarMain } from '@/components/Dashboard/navbar'
import { Spotlight } from '@/components/ui/spotlight'
import React from 'react'
import Footer from '@/components/Footer/Footer'
function page() {
  return (
    <div className="">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <NavbarMain />
      <div className="mt-8"> 
      <Section1 />
      <Section2/>
      </div>
      <Footer/>
    </div>
  )
}

export default page