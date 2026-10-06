import Link from "next/link";
import { ArrowRight, BellRing, BookOpen, Clock3, Search, ShieldCheck } from "lucide-react";

const highlights = [
  { icon: Search, title: "Discover your next read", description: "Search the library catalogue and explore titles from Open Library in one place." },
  { icon: Clock3, title: "Keep every loan on track", description: "See due dates, return books, and request extensions from your personal dashboard." },
  { icon: BellRing, title: "Never miss an update", description: "Receive live alerts for due dates, reservations, and library announcements." },
];

export default function ReaderLandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Library home">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><BookOpen className="size-5" aria-hidden="true" /></span>
          <span className="text-lg font-semibold tracking-tight">Library System</span>
        </Link>
        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <Link href="/catalog" className="hidden px-3 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-100 sm:inline-flex">Browse books</Link>
          <Link href="/login" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white">Sign in</Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
          <div className="absolute -top-32 right-0 -z-0 size-96 rounded-full bg-blue-600/15 blur-3xl" aria-hidden="true" />
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300"><ShieldCheck className="size-4" aria-hidden="true" />Your library, online</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">Find a good book. Keep the story moving.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">Search the collection, manage loans, and stay in touch with your library—all from one reader portal.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500">Explore the catalogue <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">Access my loans</Link>
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4"><div><p className="text-sm font-medium text-zinc-100">Discover the collection</p><p className="mt-1 text-xs text-zinc-500">Search by title, author, or ISBN</p></div><span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Available now</span></div>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-500"><Search className="size-4" aria-hidden="true" />Search books and authors</div>
            <div className="mt-5 grid grid-cols-3 gap-3" aria-hidden="true"><div className="h-32 rounded-lg bg-gradient-to-br from-amber-500 to-orange-700" /><div className="h-32 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-800" /><div className="h-32 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-800" /></div>
            <p className="mt-4 text-sm text-zinc-400">Thousands of stories are waiting for you.</p>
          </div>
        </section>

        <section className="border-y border-zinc-800 bg-zinc-900/40"><div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
          {highlights.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"><span className="mb-5 grid size-10 place-items-center rounded-lg bg-blue-500/10 text-blue-300"><Icon className="size-5" aria-hidden="true" /></span><h2 className="text-base font-semibold text-zinc-100">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></article>)}
        </div></section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© {new Date().getFullYear()} Library System</p><Link href="/contact" className="w-fit transition hover:text-zinc-300">Contact the library</Link></footer>
    </div>
  );
}
