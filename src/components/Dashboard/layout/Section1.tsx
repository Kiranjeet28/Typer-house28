import { Button } from '@/components/ui/button'
import React from 'react'
import KeyboardWrapper from '../Keyboard/keyboardWrapper'
import { RainbowButton } from '@/components/magicui/rainbow-button'

function Section1() {
    return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-16 flex">
                    <div className="container mx-auto">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    <div>
                                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 mb-6">
                                                    Engage in real-time typing tests, anytime!
                                            </h1>
                                            <p className="text-lg text-slate-300 mb-8">Experience instant results and track your progress easily.</p>
                                            <div className="flex gap-4">
                                                    <RainbowButton variant="outline">
                                                            Create Typo&apos;s
                                                    </RainbowButton>
                                                    <RainbowButton variant="outline">
                                                            Join Typo&apos;s
                                                    </RainbowButton>
                                            </div>
                                    </div>
                                                    <KeyboardWrapper />
                            </div>
                    </div>
            </div>
    )
}

export default Section1