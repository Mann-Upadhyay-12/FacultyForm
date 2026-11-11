import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { featuredCards } from "@/lib/data";
export default function WorkMode() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <HeroSection />
       
        <div className="pb-12">
          <FeaturedCarousel cards={featuredCards} />
        </div>
       
        <footer className="border-t border-border/40 py-12 mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Padh.ai. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
              <a href="/about" className="hover:text-primary transition-colors">About</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}