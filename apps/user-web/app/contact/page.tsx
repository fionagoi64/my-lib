"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email || message.length < 10) {
      setError("Please add your name, a valid email address, and a message of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/public/contact/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error("Unable to send feedback");
      setSubmitted(true);
      event.currentTarget.reset();
    } catch {
      setError("We could not send your message. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-100"><ArrowLeft className="size-4" />Back to home</Link>
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><BookOpen className="size-5" /></span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight">How can we help?</h1>
            <p className="mt-4 leading-7 text-zinc-400">Send a question, report a catalogue issue, or share feedback with the library team.</p>
            <div className="mt-8 space-y-4 text-sm">
              <a href="mailto:library@example.com" className="flex items-center gap-3 text-zinc-300 transition hover:text-blue-300"><Mail className="size-4 text-blue-300" />library@example.com</a>
              <p className="flex items-start gap-3 text-zinc-400"><MessageSquare className="mt-0.5 size-4 shrink-0 text-blue-300" />We aim to reply within two library working days.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/15 sm:p-8">
            {submitted ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto size-10 text-emerald-400" /><h2 className="mt-4 text-xl font-semibold">Thanks for your feedback</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Your message is with the library team. We will get back to you if a response is needed.</p><button className="mt-6 text-sm font-semibold text-blue-300 hover:text-blue-200" onClick={() => setSubmitted(false)}>Send another message</button></div> :
              <form onSubmit={submitFeedback} className="space-y-5" noValidate>
                <div><label htmlFor="name" className="text-sm font-medium">Name</label><input id="name" name="name" autoComplete="name" required className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500" /></div>
                <div><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500" /></div>
                <div><label htmlFor="message" className="text-sm font-medium">Message</label><textarea id="message" name="message" required minLength={10} rows={6} className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500" /></div>
                {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"><Send className="size-4" />{isSubmitting ? "Sending…" : "Send feedback"}</button>
              </form>}
          </section>
        </div>
      </div>
    </main>
  );
}
