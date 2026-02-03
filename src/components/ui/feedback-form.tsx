"use client"

import React, {  useState } from "react"

type Review = {
    id: string
    name?: string
    rating: number
    review?: string
    createdAt: string
}

export default function FeedbackForm() {
    const [rating, setRating] = useState(5)
    const [review, setReview] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
 
    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, review, name }),
            })

            const json = await res.json()
            if (!json.success) throw new Error(json.error || "Failed to submit")

            setMessage("Thank you for your feedback!")
            setReview("")
            setRating(5)
        } catch (err: any) {
            setMessage(err?.message || "Failed to submit")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8 rounded-lg bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Give Feedback</h3>
            <p className="text-sm text-neutral-400 mb-4">Rate the app and leave a short review.</p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="text-sm text-neutral-300 block mb-1">Your name (optional)</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white"
                        placeholder="Name"
                    />
                </div>

                <div>
                    <label className="text-sm text-neutral-300 block mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setRating(s)}
                                className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-neutral-600"}`}
                                aria-label={`Rate ${s}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-neutral-300 block mb-1">Review</label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white min-h-[80px]"
                        placeholder="Share something about your experience"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Send Feedback"}
                    </button>
                    {message && <div className="text-sm text-neutral-300">{message}</div>}
                </div>
            </form>

           
        </div>
    )
}
