'use client';
import Link from 'next/link';
import { Button, Card, Label, Text, Icon } from '@gravity-ui/uikit';
import { Flame, Calendar, Clock, HeartFill } from '@gravity-ui/icons';

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
          <Button component={Link} href="/menu" view="flat" size="l">
            Menu
          </Button>
          <Button component={Link} href="/reserve" view="flat" size="l">
            Book Table
          </Button>
          <Button component={Link} href="/login" view="outlined" size="l">
            Staff Portal
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center space-y-8">
        <div className="space-y-4 max-w-2xl flex flex-col items-center">
          <Label theme="danger" size="m" className="font-bold uppercase tracking-widest px-3 py-1 mb-2">
            Welcome to Gourmet Haven
          </Label>
          <Text variant="header-2" className="text-5xl md:text-6xl font-black tracking-tight leading-none text-base-content font-display">
            Savor the Sweet Moments of Dining
          </Text>
          <Text variant="body-1" className="text-base text-base-content/75 font-semibold leading-relaxed max-w-lg mx-auto block mt-4">
            Experience our curated signature dishes and premium table reservations in a sweet rose themed setting.
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button component={Link} href="/menu" view="action" size="xl" className="shadow-lg px-8">
            Explore Menu
          </Button>
          <Button component={Link} href="/reserve" view="outlined" size="xl" className="px-8 border-secondary hover:bg-secondary/15">
            Reserve a Table
          </Button>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <Card type="container" view="raised" theme="normal" className="p-6 text-center space-y-4 flex flex-col items-center border border-base-300 hover:border-primary transition-all duration-300">
            <div className="p-3 bg-red-50 rounded-full text-primary border border-red-100">
              <Icon data={Flame} size={28} />
            </div>
            <Text variant="subheader-3" className="font-bold text-lg text-primary block">
              Fresh Ingredients
            </Text>
            <Text variant="body-1" className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Every dish is crafted using hand-selected organic ingredients for unmatched flavor.
            </Text>
          </Card>

          <Card type="container" view="raised" theme="normal" className="p-6 text-center space-y-4 flex flex-col items-center border border-base-300 hover:border-primary transition-all duration-300">
            <div className="p-3 bg-red-50 rounded-full text-primary border border-red-100">
              <Icon data={Calendar} size={28} />
            </div>
            <Text variant="subheader-3" className="font-bold text-lg text-primary block">
              Seamless Booking
            </Text>
            <Text variant="body-1" className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Reserve your tables online and get real-time slot confirmations from our staff dashboard.
            </Text>
          </Card>

          <Card type="container" view="raised" theme="normal" className="p-6 text-center space-y-4 flex flex-col items-center border border-base-300 hover:border-primary transition-all duration-300">
            <div className="p-3 bg-red-50 rounded-full text-primary border border-red-100">
              <Icon data={Clock} size={28} />
            </div>
            <Text variant="subheader-3" className="font-bold text-lg text-primary block">
              Live Tracking
            </Text>
            <Text variant="body-1" className="text-xs text-base-content/70 font-semibold leading-relaxed">
              Keep an eye on your food prep stages directly on your smartphone order timeline.
            </Text>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-200 text-base-content border-t border-base-300 font-semibold text-xs text-base-content/65 flex justify-center items-center gap-2">
        <Icon data={HeartFill} size={14} className="text-primary" />
        <p>© {new Date().getFullYear()} Gourmet Haven. Built with love and rose petals.</p>
      </footer>
    </div>
  );
}
