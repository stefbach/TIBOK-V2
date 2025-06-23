import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import ServicesSection from "@/components/services-section"
import ProcessSection from "@/components/process-section"
import PricingSection from "@/components/pricing-section"
import AboutSection from "@/components/about-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
        <PricingSection />
        <AboutSection />
        <ContactSection />
        <div className="text-center py-8 bg-slate-100">
          <Link
            href="/doctor"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {/* TODO: Add translation key for this */}
            Accès Médecin / Doctor Access
          </Link>
          <Link
            href="/pharmacy-registration"
            className="ml-4 inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Accès Pharmacie / Pharmacy Access
          </Link>
          <Link
            href="/admin/login"
            className="ml-4 inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Accès Admin / Admin Access
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
