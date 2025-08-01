'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Keyboard } from 'lucide-react';
import Image from 'next/image';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { RainbowButton } from '@/components/magicui/rainbow-button';
import { NavbarButton } from '@/components/ui/resizable-navbar';

function Dropdown() {
    const { data: session } = useSession();

    return (
        <div>
            {session?.user ? (
                <div className="relative inline-block text-left">
                    <DropdownMenu >
                        <DropdownMenuTrigger asChild>
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-10 h-10 border-green-600 border-2 rounded-full object-cover cursor-pointer"
                                    height={40}
                                    width={40}
                                />
                            ) : (
                                <Keyboard className="w-6 h-6 cursor-pointer" />
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <div className="flex items-center gap-2 p-2">
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-10 h-10 border-green-600 border-2 rounded-full object-cover cursor-pointer"
                                        height={20}
                                        width={20}
                                    />
                                ) : (
                                    <Keyboard className="w-6 h-6 cursor-pointer" />
                                )}
                                <DropdownMenuLabel className="text-sm font-semibold">
                                    {session.user.name || 'User'}
                                </DropdownMenuLabel>
                           </div>
                            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer border-1 border-red-500 hover:text-red-500 hover:bg-red-100 flex items-center ">
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <>
                    <RainbowButton
                        onClick={() => {
                            signIn('google', { callbackUrl: '/createRoom' });
                        }}
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Create Typo&apos;s
                    </RainbowButton>
                    <NavbarButton
                        onClick={() => signIn('google')}
                        variant="secondary"
                        className="border-green-600 text-green-400 hover:bg-slate-800 bg-transparent"
                    >
                        Login
                    </NavbarButton>
                </>
            )}
        </div>
    );
}

export default Dropdown;
