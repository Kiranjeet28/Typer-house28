"use client"
import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import Keyboard from './keyboard'
import CanvasLoader from './CanvasLoader'
import HoverMoveGroup from './camra'

function KeyboardWrapper() {
    // Track scroll position
    const [scrollY, setScrollY] = React.useState(0)
    // Track animation state
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [animationProgress, setAnimationProgress] = React.useState(0)

    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Animation effect for 3D reveal
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true)
        }, 300) // Small delay to ensure canvas is ready

        return () => clearTimeout(timer)
    }, [])

    // Animate the rotation progress
    React.useEffect(() => {
        if (!isLoaded) return

        const animationDuration = 2000 // 2 seconds
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / animationDuration, 1)

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setAnimationProgress(easeOut)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }, [isLoaded])

    // Calculate rotation based on animation progress
    const getRotation = (): [number, number, number] => {
        // Original/target rotation values
        const baseRotationX = -6.03 + scrollY * 0.001
        const baseRotationY = 3.2
        const baseRotationZ = 0

        // Start with 45-degree rotation, then animate to original position
        const startRotationY = Math.PI / 4 // 45 degrees in radians
        const startRotationX = Math.PI / 12 // Slight X rotation for better 3D effect

        // Interpolate from start position to target position
        const animationRotationY = startRotationY * (1 - animationProgress)
        const animationRotationX = startRotationX * (1 - animationProgress)

        return [
            baseRotationX + animationRotationX,
            baseRotationY + animationRotationY,
            baseRotationZ
        ]
    }

    // Map scrollY to keyboard properties with animation
    const keyboardProps = {
        position: [0, -2.0, 0 + scrollY * 0.01] as [number, number, number],
        rotation: getRotation(),
        scale: [5.5, 6, 6] as [number, number, number],
    }

    // Camera controls
    const cameraProps = useControls('Camera', {
        cameraPosition: {
            value: [0, 10, -2],
            step: 0.5,
        },
    })

    // Lighting controls
    const lightingProps = useControls('Lighting', {
        ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
        spotIntensity: { value: 1, min: 0, max: 5, step: 0.1 },
        pointIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    })

    return (
        <div className="lg:w-[58vw] h-[30vh] z-10">
            {/* Leva panel hidden */}
            <Leva hidden />
            <Canvas>
                <Suspense fallback={<CanvasLoader />}>
                    <PerspectiveCamera makeDefault position={cameraProps.cameraPosition} />
                    <OrbitControls enableZoom={false} />

                    <ambientLight intensity={lightingProps.ambientIntensity} />
                    <spotLight
                        position={[10, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={lightingProps.spotIntensity}
                        castShadow
                    />
                    <pointLight
                        position={[-10, -10, -10]}
                        intensity={lightingProps.pointIntensity}
                    />
                    <HoverMoveGroup>
                    <Keyboard
                        position={keyboardProps.position}
                        rotation={keyboardProps.rotation}
                        scale={keyboardProps.scale}
                        />
                        </HoverMoveGroup>

                </Suspense>
            </Canvas>
        </div>
    )
}

export default KeyboardWrapper