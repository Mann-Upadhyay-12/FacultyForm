import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./ContentCard";
import type { ContentCard as ContentCardType } from "@/lib/data";

interface FeaturedCarouselProps {
  cards: ContentCardType[];
}

export function FeaturedCarousel({ cards }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      return () => ref.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleHistoryClick = () => {
    window.location.href = "/@me/content";
  };

  return (
    <div className="relative py-12">
      <h2
        className="heading-2 cursor-pointer hover:text-primary transition-colors"
        onClick={handleHistoryClick}
      >
        Library &#62;
      </h2>
      
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cards.map((card) => (
          <div key={card.id} className="w-[85vw] flex-shrink-0 md:w-[45vw] lg:w-[30vw] snap-start">
            <ContentCard card={card} variant="featured" />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 rounded-full bg-card border border-border md:flex"
          onClick={() => scroll("left")}
          data-testid="button-carousel-left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 rounded-full bg-card border border-border md:flex"
          onClick={() => scroll("right")}
          data-testid="button-carousel-right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}