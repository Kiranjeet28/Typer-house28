import KeyboardWrapper from '@/components/Dashboard/Keyboard/keyboardWrapper'
import { NavbarMain } from '@/components/Dashboard/navbar'
import { Spotlight } from '@/components/ui/spotlight'
import React from 'react'

function page() {
  return (
    <div className="">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <NavbarMain />
      <KeyboardWrapper />
      
    </div>
  )
}

export default page