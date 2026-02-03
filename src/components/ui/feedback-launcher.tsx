"use client"

import React, { useEffect, useRef, useState } from "react"
import FeedbackForm from "./feedback-form"

export default function FeedbackLauncher() {
    const [open, setOpen] = useState(false)
    const [hidden, setHidden] = useState(false)
    const overlayRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [])

    useEffect(() => {
        try {
            const v = typeof window !== "undefined" ? localStorage.getItem("feedback_submitted") : null
            if (v) setHidden(true)
        } catch (e) { }

        const onSubmitted = () => {
            setHidden(true)
            setOpen(false)
        }
        window.addEventListener("feedback:submitted", onSubmitted as EventListener)
        return () => window.removeEventListener("feedback:submitted", onSubmitted as EventListener)
    }, [])

    return (
        <>
            {!hidden && (
                <div className="container mx-auto px-4 py-8 flex justify-end">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-60"
                    >
                        Give Feedback
                    </button>
                </div>
            )}

            {open && (
                <div
                    ref={overlayRef}
                    onClick={(e) => {
                        if (e.target === overlayRef.current) setOpen(false)
                    }}
                    className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div className="mt-12 w-full max-w-lg">
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-md bg-neutral-800 px-3 py-1 text-sm text-white"
                            >
                                Close
                            </button>
                        </div>
                        <FeedbackForm />
                    </div>
                </div>
            )}
        </>
    )
}
