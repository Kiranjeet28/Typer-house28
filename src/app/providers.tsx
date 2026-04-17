"use client";
import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { NavbarMain } from "@/components/main/navbar";
import Footer from "@/components/Footer/Footer";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    // Initialize background services on app mount
    useEffect(() => {
        const initServices = async () => {
            try {
                const response = await fetch("/api/init", {
                    method: "GET",
                    cache: "no-store"
                });
                if (!response.ok) {
                    console.warn("Failed to initialize background services");
                }
            } catch (error) {
                // Silently fail - not critical for user experience
                console.debug("Service initialization error:", error);
            }
        };

        // Call once on mount
        initServices();
    }, []);

    return (
        <SessionProvider>
            <NavbarMain />
            {children}
            <Footer />
        </SessionProvider>
    );
}
