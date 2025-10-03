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
            // Move freely in any direction based on pointer.x and pointer.y (-1 to 1)
            group.current.position.x = state.pointer.x * 2; // left/right
            group.current.position.y = -state.pointer.y * 2; // up/down (invert y for natural feel)
        }
    });

    return <group ref={group}>{children}</group>;
};


export default HoverMoveGroup;
