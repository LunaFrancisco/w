"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  showInHome: boolean;
  _count: {
    products: number;
  };
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?hideEmpty=true');
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      // Filter only categories that should show in home
      const homeCategories = data.filter((category: Category) => category.showInHome);
      setCategories(homeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-1 bg-white">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }
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
              href={`/productos?category=${category.slug}`}
              className="group relative overflow-hidden bg-gray-100 aspect-[4/5] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0">
                {category.image ? (
                  <img
                    src={category.image.includes('r2.cloudflarestorage.com')
                      ? `/api/images/${category.image.split('/').slice(-2).join('/')}`
                      : category.image}
                    alt={`Categoría ${category.name}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm font-medium">Sin imagen</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category button */}
              <div className="absolute bottom-8 left-4 right-4 w-fit ">
                <div className="rounded-full px-8 py-2 bg-white hover:bg-green-600 hover:text-white text-center shadow-md">
                  <span className="text-sm font-bold">
                    {category.name}
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