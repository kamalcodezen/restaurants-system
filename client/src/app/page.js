'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col justify-between">
      {/* Navbar */}
      <div className="navbar bg-base-100 px-6 py-4 border-b border-base-200 shadow-sm">
        <div className="flex-1">
          <Link href="/" className="text-2xl font-black font-display text-primary uppercase tracking-wider">
            Gourmet Haven
          </Link>
        </div>
        <div className="flex-none gap-4 font-semibold text-sm">
          <Link href="/menu" className="btn btn-ghost hover:text-primary">Menu</Link>
          <Link href="/reserve" className="btn btn-ghost hover:text-primary">Book Table</Link>
          <Link href="/login" className="btn btn-outline btn-primary">Staff Portal</Link>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <span className="badge badge-primary font-black uppercase text-xs tracking-widest px-4 py-3">Welcome to gourmet heaven</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-base-content font-display">
            Savor the Sweet Moments of Dining
          </h1>
          <p className="text-base text-base-content/75 font-semibold leading-relaxed max-w-lg mx-auto">
            Experience our curated signature dishes and premium table reservations in a sweet rose themed setting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/menu" className="btn btn-primary btn-lg shadow-lg px-8">
            Explore Menu
          </Link>
          <Link href="/reserve" className="btn btn-outline btn-secondary btn-lg px-8">
            Reserve a Table
          </Link>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <div className="card bg-base-200 border border-base-300 p-6 text-center space-y-3">
            <h3 className="font-bold text-lg text-primary">Fresh Ingredients</h3>
            <p className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Every dish is crafted using hand-selected organic ingredients for unmatched flavor.
            </p>
          </div>
          <div className="card bg-base-200 border border-base-300 p-6 text-center space-y-3">
            <h3 className="font-bold text-lg text-primary">Seamless Booking</h3>
            <p className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Reserve your tables online and get real-time slot confirmations from our staff dashboard.
            </p>
          </div>
          <div className="card bg-base-200 border border-base-300 p-6 text-center space-y-3">
            <h3 className="font-bold text-lg text-primary">Live Tracking</h3>
            <p className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Keep an eye on your food prep stages directly on your smartphone order timeline.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-200 text-base-content border-t border-base-300 font-semibold text-xs text-base-content/65">
        <div>
          <p>© {new Date().getFullYear()} Gourmet Haven. Built with love and rose petals.</p>
        </div>
      </footer>
    </div>
  );
}
