"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { MeshStandardMaterial, Mesh } from "three";

type GLTFResult = {
    nodes: {
        Plane: Mesh;
        Plane_2: Mesh;
        Label_keys: Mesh;
        Logitech_Logo: Mesh;
    };
    materials: {
        Keyboard: MeshStandardMaterial;
        Silver: MeshStandardMaterial;
        "Letter Glow": MeshStandardMaterial;
    };
};

type KeyboardProps = ThreeElements["group"] & {
    glowEnabled?: boolean;
    glowSpeed?: number;
};

export function Keyboard({ glowEnabled = true, glowSpeed = 200, ...props }: KeyboardProps) {
    const { nodes, materials } = useGLTF("/models/kb.glb") as unknown as GLTFResult;
    const [glowIntensity, setGlowIntensity] = useState(0);

    // Create materials once using useMemo
    // console.log("Available materials:", Object.keys(glowSpeed));
    const { glowMaterial, basicMaterial } = useMemo(() => {
        const glow = materials["Letter Glow"].clone();
        const basic = materials["Letter Glow"].clone();
        basic.emissiveIntensity = 0;

        // Set a new color for the key labels (e.g., blue)
        glow.color.set("#03e3cc");
        basic.color.set("#03e3cc");

        return { glowMaterial: glow, basicMaterial: basic };
    }, [materials])
    
    // Update glow material intensity
    useEffect(() => {
        if (glowMaterial) {
            glowMaterial.emissiveIntensity = glowIntensity;
        }
    }, [glowIntensity, glowMaterial]);

    // Glow animation effect
    useEffect(() => {
        if (glowEnabled) {
            setGlowIntensity(1);
        } else {
            setGlowIntensity(0);
        }
    }, [glowEnabled]);

    // Cleanup materials on unmount
    useEffect(() => {
        return () => {
            glowMaterial?.dispose();
            basicMaterial?.dispose();
        };
    }, [glowMaterial, basicMaterial]);

    const currentMaterial = glowIntensity === 0 ? basicMaterial : glowMaterial;
    // Add this in your useMemo block to create a special material for the K key
    const kKeyMaterial = useMemo(() => {
        const mat = materials["Letter Glow"].clone();
        mat.color.set("#ff0000"); // Set to red or any color you want
        mat.emissiveIntensity = glowIntensity;
        return mat;
    }, [materials, glowIntensity]);

    // In your JSX, add a mesh for the K key (replace 'K_Key' with the actual node name)
   
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane.geometry}
                material={materials.Keyboard}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane_2.geometry}
                material={materials.Silver}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Label_keys.geometry}
                material={currentMaterial}
                position={[-2.873, 0.303, 0.742]}
                scale={0.055}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Logitech_Logo.geometry}
                material={currentMaterial}
                position={[2.916, 0.187, -0.918]}
                scale={0.221}
            />
        </group>
    );
}

useGLTF.preload("/models/kb.glb");
export default Keyboard;