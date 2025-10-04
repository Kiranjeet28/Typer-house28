import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
    children: React.ReactNode;
};

const HoverMoveGroup = ({ children }: Props) => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Add subtle floating animation
            const time = state.clock.getElapsedTime();
            const floatX = Math.sin(time * 0.5) * 0.1;
            const floatY = Math.cos(time * 0.3) * 0.1;

            // Mouse-based movement
            const targetX = state.pointer.x * 2 + floatX;
            const targetY = -state.pointer.y * 2 + floatY;

            // Smooth interpolation (lerp) for natural movement
            group.current.position.x += (targetX - group.current.position.x) * 0.05;
            group.current.position.y += (targetY - group.current.position.y) * 0.05;

            // Optional: Add subtle rotation based on position
            group.current.rotation.y = group.current.position.x * 0.1;
            group.current.rotation.x = group.current.position.y * 0.05;
        }
    });

    return <group ref={group}>{children}</group>;
};

export default HoverMoveGroup;