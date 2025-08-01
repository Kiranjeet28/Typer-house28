"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { RainbowButton } from "../magicui/rainbow-button";
import Image from "next/image";
import { Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";
import Dropdown from "./Profile/Dropdown";

export function NavbarMain() {
    const { data: session } = useSession();
    const route = useRouter();
    const navItems = [
        {
            name: "Home",
            link: "/",
            onClick: () => route.push("/"),
        },
        {
            name: "Pricing",
            link: "/others/pricing",
            onClick: () => route.push("/others/pricing"),
        },
        {
            name: "Create",
            link: "/createRoom",
            onClick: () => {
                if (!session) {
                    signIn("google");
                } else {
                    route.push("/createRoom");
                }
            },
        },
        {
            name: "Join",
            link: "/join",
            onClick: () => {
                if (!session) {
                    signIn("google");
                } else {
                    route.push("/join");
                }
            },
        }
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                    <Dropdown/>
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                    {navItems.map((item, idx) => (
                        <a
                            key={`mobile-link-${idx}`}
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="relative text-neutral-600 dark:text-neutral-300"
                        >
                            <span className="block">{item.name}</span>
                        </a>
                    ))}

                    <div className="flex w-full flex-col gap-4 mt-4">
                        {session?.user ? (
                            <div className="flex items-center gap-2">
                                {session.user.image && session.user.image !== "" ? (
                                    <Image
                                        alt="Profile"
                                        src={session.user.image ?? "/default-profile.png"}
                                        className="w-10 h-10 border-green-600 border-2 rounded-full object-cover"
                                        height={40}
                                        width={40}
                                    />
                                ) : (
                                    <Keyboard className="w-10 h-10" />
                                )}
                                <NavbarButton
                                    onClick={() => {
                                        signOut();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant="secondary"
                                    className="border-red-600 text-red-400 hover:bg-slate-800 bg-transparent"
                                >
                                    Sign Out
                                </NavbarButton>
                            </div>
                        ) : (
                            <>
                                <RainbowButton
                                    variant="outline"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        signIn("google");
                                        route.push("/createRoom");
                                    }}
                                >
                                    Create Typo&apos;s
                                </RainbowButton>
                                <NavbarButton
                                    onClick={() => {
                                        signIn("google");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant="secondary"
                                    className="border-green-600 text-green-400 hover:bg-slate-800 bg-transparent"
                                >
                                    Login
                                </NavbarButton>
                            </>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}