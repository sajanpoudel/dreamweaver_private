import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Key, LineChart, Moon } from 'lucide-react';

const features = [
  {
    name: 'Dream Capture',
    description: 'Record your dreams in detail with our intuitive interface.',
    icon: Moon,
  },
  {
    name: 'AI Analysis',
    description: 'Get deep insights into your dreams using advanced AI technology.',
    icon: Brain,
  },
  {
    name: 'Pattern Recognition',
    description: 'Identify recurring themes and symbols in your dreams.',
    icon: Key,
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor your dream patterns and emotional trends over time.',
    icon: LineChart,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center py-12 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Unlock the Secrets of Your{' '}
              <span className="text-primary">Subconscious Mind</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Dream Weaver helps you capture, analyze, and understand your dreams with
              AI-powered insights. Start your journey of self-discovery today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24 bg-muted/50">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Features</h2>
            <p className="text-lg text-muted-foreground mt-4">
              Everything you need to understand your dreams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-background rounded-lg p-6 shadow-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
