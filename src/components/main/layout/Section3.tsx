"use client"

import { MagicCard } from "@/components/magicui/magic-card"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { TextAnimate } from "@/components/ui/text-animate"
import { DUMMY_FEATURES } from "@/resources/constant"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import SelfTestButton from "@/components/selfTest/button"

export function Section3() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const appRef = useRef<any>(null)
    const keyboardRef = useRef<any>(null)
    const gsapRef = useRef<any>(null)
    const [hoveredKey, setHoveredKey] = useState<string | null>(null)
    const router = useRouter()
    const selfTestContainerRef = useRef<HTMLDivElement | null>(null)


    // Load Spline scene and wire up references
    useEffect(() => {
        let mounted = true
        const load = async () => {
            // Dynamically import gsap and Spline runtime (avoids SSR issues)
            const [{ gsap }, { Application }] = await Promise.all([import("gsap"), import("@splinetool/runtime")])
            gsapRef.current = gsap

            if (!canvasRef.current || !mounted) return

            const app = new Application(canvasRef.current)
            appRef.current = app

            try {
                // Using the same scene URL as the original example
                await app.load("https://prod.spline.design/ZZOWNi4tS7p8xxOs/scene.splinecode")

                // Disable all mouse interactions including zoom
                if (canvasRef.current) {
                    canvasRef.current.style.pointerEvents = "none"
                }

                // The original file looked up "keyboard" by name
                const keyboard = app.findObjectByName("keyboard")
                keyboardRef.current = keyboard


            } catch (err) {
                console.error("[Typerhouse] Failed to load Spline scene:", err)
            }
        }

        load()
        return () => {
            mounted = false
        }
    }, [])

    // Handle hover animation: subtly tilt the 3D keyboard, emit a keyDown, and press the UI key
    const handleFeatureHover = (key: string | null) => {
        setHoveredKey(key)

        const keyboard = keyboardRef.current
        const gsap = gsapRef.current
        const app = appRef.current

        if (!keyboard || !gsap) return

        if (key) {
            // Subtle tilt forward and slight yaw for "engagement"
            gsap.to(keyboard.rotation, { x: -Math.PI / 36, y: Math.PI / 48, z: 0, duration: 0.35, ease: "power2.out" })
            // Nudge position a bit
            gsap.to(keyboard.position, { x: 120, y: 45, duration: 0.35, ease: "power2.out" })

            // Emit a generic keyDown to trigger any Spline-keyboard animation present
            try {
                app?.emitEvent?.("keyDown", "keyboard")
            } catch { }
        } else {
            // Reset
            gsap.to(keyboard.rotation, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.out" })
            gsap.to(keyboard.position, { x: 110, y: 50, duration: 0.4, ease: "power2.out" })
        }
    }

    // Handle clicks on the feature cards
    const handleFeatureClick = (feature: any) => {
        if (!feature) return

        console.debug("feature click:", feature?.key)

        const key = feature.key
        switch (key) {
            case "A": // Create Room
                router.push("/createRoom")
                break
            case "S": // Join Room
                router.push("/join")
                break
            case "D": // Test your Typing -> trigger hidden SelfTestButton
                try {
                    const container = selfTestContainerRef.current
                    const btn = container?.querySelector("button") as HTMLButtonElement | null
                    if (btn) btn.click()
                } catch (e) {
                    console.error("Failed to trigger self test:", e)
                }
                break
            case "F": // AI Coach
                router.push("/dashboard#ai-tips")
                break
            default:
                break
        }
    }

    return (
        <section
            aria-labelledby="typerhouse-features-heading "
            className="relative w-full  p-5 "
        >
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left panel: features */}
                <div className="h-[60vh]  p-6 flex flex-col">

                    {/* Features list; allow internal scroll if content exceeds height */}
                    <TextAnimate animation="blurIn" as="h1" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Let's Grow Together
                    </TextAnimate>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 overflow-y-auto">
                        {DUMMY_FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                onMouseEnter={() => handleFeatureHover(feature.key)}
                                onMouseLeave={() => handleFeatureHover(null)}
                                onClick={() => handleFeatureClick(feature)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        handleFeatureClick(feature)
                                    }
                                }}
                            >
                                <MagicCard
                                    gradientColor={"#262626"}
                                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg  p-4 transition-colors hover:bg-accent/20 cursor-pointer"
                                >
                                    <div className="mb-2 inline-flex items-center gap-2">
                                        <RainbowButton className={[
                                            "inline-flex h-7 min-w-7 px-2 items-center justify-center rounded",
                                            "text-sm bg-muted text-foreground/80 border border-border",
                                            hoveredKey === feature.key ? "pressing shadow-inner" : "shadow-sm",
                                        ].join(" ")} variant="outline">{feature.key}</RainbowButton>
                                        <h3 className="text-foreground font-medium">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </MagicCard>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel: fixed-size model container that fills the column */}
                <div className="h-[60vh]">
                    <div className="relative h-[60vh] w-[40vw] overflow-hidden">
                        <canvas
                            ref={canvasRef}
                            id="typerhouse-keyboard"
                            className="absolute inset-0 h-[50vw] w-full "
                        />
                    </div>
                </div>
            </div>

            {/* Hidden offscreen SelfTestButton used for programmatic triggering */}
            <div ref={selfTestContainerRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <SelfTestButton />
            </div>

        </section>
    )
}

export default Section3