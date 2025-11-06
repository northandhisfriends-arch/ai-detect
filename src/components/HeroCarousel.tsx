import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";

const HeroCarousel = ({ isServerOnline }: { isServerOnline: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);


  const slides = [
    { image: hero1, title: "Title 1", subtitle: "Subtitle 1" },
    { image: hero2, title: "Title 2", subtitle: "Subtitle 2" },
    { image: hero3, title: "Title 3", subtitle: "Subtitle 3" },
    { image: hero4, title: "Title 4", subtitle: "Subtitle 4" },
    { image: hero5, title: "Title 5", subtitle: "Subtitle 5" },
  ];

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide effect (ไม่บังคับ แต่มีประโยชน์)
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // เปลี่ยนสไลด์ทุก 5 วินาที
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (

    <div className="relative w-full h-[600px] overflow-hidden rounded-xl shadow-2xl">

      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              {slide.subtitle}
            </p>

            <Link to="/questionnaire">
              <Button
                id="startButton"
                style={{ display: isServerOnline ? 'flex' : 'none' }}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                START
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
