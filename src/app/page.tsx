"use client"
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic, FileText, Download, Languages, Sparkles, Clock, CheckCircle2, ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
// Keep these imports for when you need them in your app component
import { useSession } from "next-auth/react";
import { saveTranscriptionHistory } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  // The Home component should only contain code for the landing page
  // The session and history-related code should be in your app/app/page.tsx component
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section with gradient background */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-slate-50/30 dark:to-slate-900/30 z-0"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col space-y-6 max-w-[600px] mx-auto lg:mx-0">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm self-start">
                <span className="mr-1 rounded-full bg-primary h-2 w-2 animate-pulse"></span>
                <span className="text-primary font-medium">AI-Powered Documentation</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                Transform Speech into <span className="text-primary relative inline-block">
                  Documentation
                  
                </span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Record or upload speech in any language and let AI convert it into structured, 
                professional documentation in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild size="lg" className="px-8 group relative overflow-hidden">
                  <Link href="/app" className="flex items-center gap-2">
                    Get Started 
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 w-full h-full bg-white/10 transition-all duration-300 transform translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-20"></span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="group">
                  <Link href="#how-it-works" className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    See How It Works
                    
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-amber-500",
                    "bg-rose-500"
                  ].map((color, i) => (
                    <div key={i} className={cn("w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white", color)}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">1,200+</span> professionals trust SpeechPoint
                </div>
              </div>
            </div>
            
            <div className="relative mx-auto lg:mx-0 w-full max-w-[600px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 -z-10 transform -rotate-3"></div>
              <div className="relative rounded-xl overflow-hidden border shadow-lg bg-background/80 backdrop-blur-sm transform transition-transform hover:scale-[1.01] duration-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Voice Recording</h3>
                        <p className="text-sm text-muted-foreground">Processing in real-time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-sm text-muted-foreground">Recording...</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-2/3 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Transcription</h4>
                        <span className="text-xs text-muted-foreground">01:45 / 05:00</span>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm">
                          "The quarterly report shows a 15% increase in revenue compared to last year. 
                          Our new product line has exceeded expectations with a 30% conversion rate..."
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Key Points (Generated)</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm">15% revenue increase in quarterly report</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm">New product line exceeded expectations</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm">30% conversion rate achieved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-slate-50 dark:bg-slate-950/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm mb-4">
              <span className="text-primary font-medium">Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              Our AI-powered platform handles the entire process from speech to documentation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Mic className="h-8 w-8 text-primary" />,
                title: "Speech-to-Text",
                description: "Accurate transcription of speech in any language using OpenAI's Whisper API"
              },
              {
                icon: <Sparkles className="h-8 w-8 text-primary" />,
                title: "AI Summarization",
                description: "Extract key insights and important points from your transcription using GPT-4"
              },
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                title: "Auto Documentation",
                description: "Convert extracted points into structured, professional documentation"
              },
              {
                icon: <Download className="h-8 w-8 text-primary" />,
                title: "Export Options",
                description: "Download your documentation as PDF or Markdown files"
              },
              {
                icon: <Languages className="h-8 w-8 text-primary" />,
                title: "Multi-Language",
                description: "Support for all major languages with accurate transcription"
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Time-Saving",
                description: "Reduce documentation time by up to 90% compared to manual methods"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm mb-4">
              <span className="text-primary font-medium">Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple, fast, and efficient - from speech to documentation in minutes
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent hidden md:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Record or Upload",
                  description: "Record speech directly in the app or upload an audio file in any format"
                },
                {
                  step: "02",
                  title: "AI Processing",
                  description: "Our AI transcribes the speech and extracts key points and insights"
                },
                {
                  step: "03",
                  title: "Download",
                  description: "Review and download your structured documentation as PDF or Markdown"
                }
              ].map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center">
                  <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/20 transition-transform hover:scale-105 duration-300">
                    <span className="text-xl font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-24 bg-slate-50 dark:bg-slate-950/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm mb-4">
              <span className="text-primary font-medium">Pricing</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that works best for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-xl border bg-background p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:border-muted">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-muted-foreground">Perfect for trying out the service</p>
              </div>
              <ul className="mb-8 space-y-4">
                {[
                  "5 minutes of transcription per month",
                  "Basic documentation format",
                  "PDF export"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full transition-all duration-300 hover:shadow-md">
                <Link href="/app">Get Started</Link>
              </Button>
            </div>
            
            <div className="rounded-xl border-2 border-primary bg-background p-8 shadow-md relative transform hover:scale-[1.02] transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                POPULAR
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-muted-foreground">Per month, billed monthly</p>
              </div>
              <ul className="mb-8 space-y-4">
                {[
                  "2 hours of transcription per month",
                  "Advanced documentation formats",
                  "PDF and Markdown export",
                  "Priority processing"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full shadow-sm hover:shadow-md transition-all duration-300">
                <Link href="/app">Subscribe</Link>
              </Button>
            </div>
            
            <div className="rounded-xl border bg-background p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:border-muted">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="mt-2 text-muted-foreground">For teams and organizations</p>
              </div>
              <ul className="mb-8 space-y-4">
                {[
                  "Unlimited transcription",
                  "Custom documentation templates",
                  "All export formats",
                  "Dedicated support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full hover:bg-primary/5 transition-all duration-300">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm mb-4">
              <span className="text-primary font-medium">Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg">
              Trusted by professionals across industries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "SpeechPoint has revolutionized how I document client meetings. What used to take hours now takes minutes.",
                author: "Sarah Johnson",
                title: "Marketing Director"
              },
              {
                quote: "The accuracy of the transcription is impressive. It handles technical medical terminology better than any other solution I've tried.",
                author: "Dr. Michael Chen",
                title: "Healthcare Professional"
              },
              {
                quote: "As someone who conducts interviews daily, this tool has become indispensable. The time savings alone justify the subscription.",
                author: "James Wilson",
                title: "Journalist"
              }
            ].map((testimonial, index) => (
              <div key={index} className="rounded-xl border bg-background p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:border-muted">
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 mr-1">★</span>
                    ))}
                  </div>
                  <blockquote className="flex-grow mb-6">
                    <p className="text-lg italic">"{testimonial.quote}"</p>
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">{testimonial.author[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-white/[0.05]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm mb-2">
              <span className="text-white font-medium">Limited Time Offer</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Transform Your Documentation Process?
            </h2>
            <p className="text-lg text-white/80 max-w-[800px]">
              Join thousands of professionals who save hours every week with SpeechPoint. 
              Sign up today and get 50% off your first month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 px-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/app" className="flex items-center gap-2">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transition-all duration-300">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-6 text-white/60 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-4 w-4" />
              <span>Cancel anytime</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-4 w-4" />
              <span>14-day money back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">SP</span>
                </div>
                <h3 className="text-lg font-semibold">SpeechPoint</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered speech-to-documentation platform that saves you time and effort.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: "About", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SpeechPoint. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-6 md:mt-0">
              {[
                { 
                  label: "Twitter", 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                },
                { 
                  label: "LinkedIn", 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                },
                { 
                  label: "GitHub", 
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                }
              ].map((social, index) => (
                <Link key={index} href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// After successful transcription and summarization:


