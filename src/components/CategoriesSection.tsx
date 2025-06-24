"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: "Edibles",
    title: "Edibles",
    image: "https://images.unsplash.com/photo-1539614474468-f423a2d2270c?w=400&h=600&fit=crop&crop=center",
    href: "/categoria/hombre"
  },
  {
    id: "Extractos", 
    title: "Extractos",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&crop=center",
    href: "/categoria/mujer"
  },
  {
    id: "Flores",
    title: "Flores", 
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=600&fit=crop&crop=center",
    href: "/categoria/ninos"
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-1 bg-white">
      <div className=" mx-auto ">
        {/* <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Categórias
          </h2>
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-1">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden bg-gray-100 aspect-[4/5] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0">
                <Image
                  src={category.image}
                  alt={`Categoría ${category.title}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                />
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category button */}
              <div className="absolute bottom-8 left-4 right-4 w-fit ">
                <div className="rounded-full px-8 py-2 bg-white hover:bg-green-600 hover:text-white text-center shadow-md">
                  <span className="text-sm font-bold">
                    {category.title}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}