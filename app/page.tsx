import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Chess Analysis</h1>
        <p className="text-neutral-400">Analyze your Chess.com games with personalized insights.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="px-3 py-2 bg-emerald-400 text-black rounded">Login</Link>
          <Link href="/register" className="px-3 py-2 bg-transparent border border-emerald-400 text-emerald-300 rounded">Register</Link>
        </div>
      </div>
    </main>
  );
}
