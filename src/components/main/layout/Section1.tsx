"use client";
import { Button } from '@/components/ui/button'
import React from 'react'
import KeyboardWrapper from '../Keyboard/keyboardWrapper'
import { useRouter } from 'next/navigation';
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import { useSession, signIn } from 'next-auth/react';

function Section1() {
        const route = useRouter();
        const { data: session } = useSession();

        const handleButtonClick = (path: string) => {
                if (!session) {
                        signIn(undefined, { callbackUrl: path });
                } else {
                        route.push(path);
                }
        };

        return (
                <div className="grid bg-gradient-to-br from-slate-800 to-slate-900 lg:grid-cols-3 gap-12 items-center p-10">
                        {/* Left side takes 1 column */}
                        <div className="lg:col-span-1">
                                <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 ">
                                        Engage in real-time
                                        <span className="m-2 md:hidden block">Typing</span>
                                        <PointerHighlight
                                                rectangleClassName="bg-[oklch(0.91_0.23_133/0.52)] border-green-300 dark:border-green-700"
                                                pointerClassName="text-green-500 h-3 w-3"
                                                containerClassName="inline-block ml-1 hidden md:block"
                                        >
                                                <span className="m-2">Typing</span>
                                        </PointerHighlight>
                                        tests, anytime!
                                </h1>
                                <p className="text-lg text-slate-300 ">
                                        Experience instant results and track your progress easily.
                                </p>
                                {/* <div className="flex gap-4">
                                        <RainbowButton
                                                variant="outline"
                                                onClick={() => handleButtonClick("/createRoom")}
                                        >
                                                Create Typo&apos;s
                                        </RainbowButton>
                                        <RainbowButton
                                                variant="outline"
                                                onClick={() => handleButtonClick("/join")}
                                        >
                                                Join Typo&apos;s
                                        </RainbowButton>
                                </div> */}
                        </div>

                        {/* Right side takes 2 columns */}
                        <div className="lg:col-span-2">
                                <KeyboardWrapper />
                        </div>
                </div>

        )
}

export default Section1