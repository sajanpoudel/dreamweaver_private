import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { HomeHeader } from '@/components/HomeHeader';
import { Button } from '@/components/ui/button';
import { Brain, Moon, Sparkles, LineChart } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    name: 'Dream Recording',
    description: 'Capture your dreams in detail with our intuitive interface, including voice recording options.',
    icon: Moon,
  },
  {
    name: 'AI Analysis',
    description: 'Get deep insights into your dreams using advanced AI technology that understands dream symbolism.',
    icon: Brain,
  },
  {
    name: 'Pattern Recognition',
    description: 'Discover recurring themes and symbols in your dreams to understand your subconscious better.',
    icon: Sparkles,
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor your emotional patterns and dream evolution over time with detailed analytics.',
    icon: LineChart,
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <HomeHeader />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 text-transparent bg-clip-text leading-tight mb-6">
              Unlock the Secrets of Your Dreams
            </h1>
            <p className="text-xl text-purple-100/80 mb-8 leading-relaxed">
              Dreamly helps you capture, analyze, and understand your dreams with 
              AI-powered insights. Transform your dream journaling experience and discover 
              the hidden meanings in your subconscious mind.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:text-white hover:bg-purple-500/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text mb-4">
              Features
            </h2>
            <p className="text-lg text-purple-100/80">
              Everything you need to understand your dreams better
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
                <div className="relative p-6 backdrop-blur-sm border border-purple-500/20 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-100 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-purple-200/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
