import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Services from '@/components/Services';
import CaseStudies from '@/components/CaseStudies';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ChatAssistant from '@/components/ChatAssistant';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <Features />
      <Services />
      {/*<CaseStudies />
      <Testimonials />
      <Pricing />*/}
      <CTA />
      <Footer />
      <ChatAssistant />
    </main>
  );
} 