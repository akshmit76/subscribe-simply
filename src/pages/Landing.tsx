import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">SubSage</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth?signup=true">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <Shield className="w-4 h-4" />
            Trusted by 10,000+ users
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            Take control of your
            <span className="block gradient-text">subscriptions</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Track all your subscriptions in one place. Avoid surprise charges and reduce financial stress with smart reminders and insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/auth?signup=true">
              <Button variant="hero" size="xl">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="#pricing">
              <Button variant="hero-outline" size="xl">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage subscriptions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, powerful tools to track spending and never miss a payment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CreditCard className="w-6 h-6" />}
              title="Track Everything"
              description="Add all your subscriptions with full details - amount, billing cycle, category, and payment method."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Calendar View"
              description="Visual calendar showing upcoming charges. Get reminders 3 days before billing dates."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Smart Insights"
              description="See your monthly and yearly spend at a glance. Flag subscriptions you rarely use."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <PricingCard 
              title="Free"
              price="$0"
              description="Perfect for getting started"
              features={[
                'Up to 5 subscriptions',
                'Dashboard & calendar view',
                'Monthly spend tracking',
                'Basic insights',
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard 
              title="Pro"
              price="$7"
              period="/month"
              description="For power users"
              features={[
                'Unlimited subscriptions',
                'Email reminders',
                'In-app alerts',
                'Advanced insights',
                'Priority support',
              ]}
              buttonText="Start Pro Trial"
              buttonVariant="hero"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to take control?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of users who've saved money with SubSage
          </p>
          <Link to="/auth?signup=true">
            <Button size="xl" className="bg-card text-foreground hover:bg-card/90">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium">SubSage</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 SubSage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevated transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  period = '',
  description, 
  features, 
  buttonText,
  buttonVariant = 'default',
  highlighted = false 
}: { 
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'hero';
  highlighted?: boolean;
}) {
  return (
    <div className={`p-8 rounded-2xl border ${
      highlighted 
        ? 'bg-card border-primary shadow-glow' 
        : 'bg-card border-border shadow-soft'
    }`}>
      {highlighted && (
        <div className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-1">{title}</h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-success" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link to="/auth?signup=true">
        <Button variant={buttonVariant} className="w-full">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
