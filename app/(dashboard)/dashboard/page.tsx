import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-neutral-400">{session.user.email}</div>
      </header>
      <div className="mt-6 space-y-4">
        <div className="bg-[#1a1a1a] border border-neutral-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Connect Chess.com</h2>
          <p className="text-sm text-neutral-400">Enter your Chess.com username to fetch and analyze your last 100 games.</p>
          <Link className="inline-block mt-3 px-3 py-2 bg-emerald-400 text-black rounded" href="/games">Go to Games</Link>
        </div>
      </div>
    </div>
  );
}
