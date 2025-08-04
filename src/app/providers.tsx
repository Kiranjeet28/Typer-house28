"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { NavbarMain } from "@/components/main/navbar
import Footer from "@/components/Footer/Footer";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <NavbarMain />
            {children}
            <Footer />
        </SessionProvider>
    );
}
