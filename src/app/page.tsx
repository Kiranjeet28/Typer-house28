'use client'
import Section1 from '@/components/main/layout/Section1'
import Section2 from '@/components/main/layout/Section2'
import Section3 from '@/components/main/layout/Section3'
import { Spotlight } from '@/components/ui/spotlight'
import FeedbackForm from '@/components/ui/feedback-form'
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
        {/* Feedback section for homepage */}
        <div id="feedback" className="container mx-auto px-4 py-8">
          <FeedbackForm />
        </div>
      </div>


    </div>
  )
}

export default page