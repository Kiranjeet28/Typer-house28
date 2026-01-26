'use client'
import Section1 from '@/components/main/layout/Section1'
import Section2 from '@/components/main/layout/Section2'
import Section3 from '@/components/main/layout/Section3'
import RestrictedTextarea from '@/components/Room/test/textarea'
import { Spotlight } from '@/components/ui/spotlight'
import React, { useRef, useState } from 'react'
function page() {
  const overLimit = false;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (overLimit) return;
    setInput(e.target.value); // This was missing!
  }
  return (
    <div className="">
      {/* <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="mt-8"> 
        <Section1 />
        <Section3 />
        <Section2 /> 
    </div> */}

      <RestrictedTextarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        overLimit={overLimit}
      />
    </div>
  )
}

export default page