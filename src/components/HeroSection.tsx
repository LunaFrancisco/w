"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const gifs = ["https://i.pinimg.com/originals/f2/69/3b/f2693be74b453a748d5a9ceddd8c6f7d.gif", "https://i.pinimg.com/originals/f3/e1/3c/f3e13c7368daede5b6fe98bc731aa10a.gif"];
const gifAlts = [
  "Fondo animado artístico de labios",
  "Fondo animado artístico de ojo",
];

export default function HeroSection() {
  const [activeGifIndex, setActiveGifIndex] = useState(0);
  const gifDuration = 7000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveGifIndex((prevIndex) => (prevIndex + 1) % gifs.length);
    }, gifDuration);
    return () => clearTimeout(timer);
  }, [activeGifIndex]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-28 pb-12 md:pt-32 md:pb-20 text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {gifs.map((gifSrc, index) => (
          <div
            key={gifSrc}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out 
                        ${activeGifIndex === index ? "opacity-30 md:opacity-20" : "opacity-0"}`}
          >
            <Image
              src={gifSrc || "/placeholder.svg"}
              alt={gifAlts[index]}
              layout="fill"
              objectFit="cover"
              className="mix-blend-screen"
              unoptimized
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      <div className="relative z-20 container mx-auto px-4 md:px-6 mt-10 md:mt-16">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 md:mb-8">
          Bienestar Natural Elevado
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-stone-700 mb-8 md:mb-10">
          Cannabis medicinal de calidad superior en Seattle. Descubre alivio y
          conocimiento con nosotros.
        </p>
        <Button
          size="lg"
          className="bg-black text-white rounded-full px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-bold hover:bg-emerald-700 transition-colors duration-300"
        >
          Explorar Productos
        </Button>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center">
          <div className="w-1 h-3 bg-black rounded-full mt-2 animate-scroll" />
        </div>
      </div>
    </section>
  );
}
