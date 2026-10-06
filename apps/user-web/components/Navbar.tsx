import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 dark:bg-black dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg dark:bg-white flex items-center justify-center">
          <span className="text-white dark:text-black font-bold text-lg">L</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-black dark:text-white">LibrarySystem</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
          Home
        </Link>
        <Link href="/users" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
          Users
        </Link>
        <a 
          href="http://localhost:4000/swagger" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          API Docs
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 11L11 1M11 1H3.5M11 1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </nav>
  );
}
