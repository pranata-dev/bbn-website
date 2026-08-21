import {
  Navbar,
  HeroSection,
  ProgramsSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
  FloatingActionButton,
} from "@/components/landing"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFEED6]/20 text-[#827148] relative font-sans">
      {/* 1. Header / Navbar */}
      <Navbar />
      
      {/* Hero Section & Floating Stats */}
      <HeroSection />

      {/* Program Section */}
      <ProgramsSection />

      {/* Fitur Section */}
      <FeaturesSection />

      {/* Cara Kerja Section */}
      <HowItWorksSection />

      {/* Harga Section */}
      <PricingSection />

      {/* 2. FAQ Section */}
      <FAQSection />

      {/* 3. CTA Section */}
      <CTASection />

      {/* 4. Footer Section */}
      <Footer />

      {/* Floating Action Button */}
      <FloatingActionButton />
    </main>
  )
}
