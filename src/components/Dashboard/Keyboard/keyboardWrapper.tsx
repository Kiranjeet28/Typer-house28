"use client"
import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import Keyboard from './keyboard'

// Extend the JSX namespace for react-three-fiber to support SVG if needed
declare global {
    namespace JSX {
        interface IntrinsicElements {
            svg: React.DetailedHTMLProps<React.SVGAttributes<SVGSVGElement>, SVGSVGElement>;
        }
    }
}

function CanvasLoader() {
    return null
}

function KeyboardWrapper() {
    // Leva controls for the keyboard
    // Track scroll position
    const [scrollY, setScrollY] = React.useState(0)

    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Map scrollY to keyboard properties
    const keyboardProps = {
        position: [0, -2.0, 0 + scrollY * 0.01] as [number, number, number],
        rotation: [-6.03 + scrollY * 0.001, 3.2, 0] as [number, number, number],
        scale: [5.5 , 6, 6] as [number, number, number],
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
        <div className="relative">
            {/* Leva panel removed */}
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

                    <Keyboard
                        position={keyboardProps.position}
                        rotation={keyboardProps.rotation}
                        scale={keyboardProps.scale}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}

export default KeyboardWrapper
