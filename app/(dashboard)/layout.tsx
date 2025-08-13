import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-neutral-800 bg-[#111]">
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-3 text-sm">
          <Link href="/dashboard" className="hover:text-emerald-300">Dashboard</Link>
          <Link href="/games" className="hover:text-emerald-300">Games</Link>
          <Link href="/analysis" className="hover:text-emerald-300">Analysis</Link>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
