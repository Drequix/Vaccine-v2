import { Features } from "@/components/homepage/Features";
import { Footer } from "@/components/homepage/Footer";
import { Header } from "@/components/homepage/Header";
import { Hero } from "@/components/homepage/Hero";
import { NewsAndInfo } from "@/components/homepage/NewsAndInfo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      <main>
        <Hero />
        <Features />
        <NewsAndInfo />
      </main>
      <Footer />
    </div>
  );
}

