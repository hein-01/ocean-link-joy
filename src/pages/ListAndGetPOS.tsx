import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { 
  ShoppingCart, 
  Globe, 
  Smartphone, 
  BarChart3, 
  CreditCard, 
  Zap,
  Check,
  Star,
  ArrowRight
} from "lucide-react";

const ListAndGetPOS = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Professional Website",
      description: "Get a beautiful, mobile-responsive website for your business"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Online Store",
      description: "Sell your products online with integrated e-commerce"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile POS System",
      description: "Accept payments anywhere with our mobile point-of-sale"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track sales, inventory, and customer insights"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Payment Processing",
      description: "Accept all major credit cards and digital payments"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Setup",
      description: "Get up and running in minutes, not weeks"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small businesses just getting started",
      features: [
        "Professional website",
        "Basic online store (up to 50 products)",
        "Mobile POS app",
        "Payment processing",
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Everything in Starter",
        "Unlimited products",
        "Advanced analytics",
        "Inventory management",
        "Customer management",
        "Priority support",
        "Custom domain"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For established businesses with advanced needs",
      features: [
        "Everything in Professional",
        "Multi-location support",
        "Advanced reporting",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-20">
        <BackButton />
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 All-in-One Business Solution
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            Get Your Online Shop Website + 
            <span className="text-primary"> POS System</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to sell online and in-person. Professional website, 
            mobile POS, payment processing, and analytics - all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
              onClick={() => navigate("/list-business")}
            >
              Accept Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo (2 min)
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our integrated platform gives you all the tools to succeed online and offline
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a 14-day free trial. No setup fees. Cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate("/list-business")}
                  >
                    Accept Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Get answers to common questions about our platform
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="setup-time" className="bg-card rounded-lg border border-border px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                How quickly can I get my website and POS system set up?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most businesses are up and running within 24-48 hours. Our instant setup process includes automated website creation, POS app installation, and payment processing activation. You can start taking orders immediately after completing the simple onboarding process.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="offline-pos" className="bg-card rounded-lg border border-border px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                Can I use the POS system offline?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Our mobile POS system works completely offline. All transactions are stored locally and automatically sync to the cloud when internet connection is restored. This ensures you never miss a sale, whether you're at a farmers market, pop-up shop, or experiencing connectivity issues.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="payment-methods" className="bg-card rounded-lg border border-border px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                What payment methods does the system accept?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, contactless payments (Apple Pay, Google Pay, Samsung Pay), and digital wallets. Transaction fees start at 2.9% + 30¢ per transaction with no monthly processing fees.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to grow their sales
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 group">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListAndGetPOS;