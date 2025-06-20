"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { CartCounter } from "./ecommerce/CartCounter";
import { CartDrawer } from "./ecommerce/CartDrawer";
import { useCart } from "@/hooks/useCart";


export default function FloatingCartButton() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useCart();

  return (
    <>
      <Button
        variant="outline"
        className="fixed top-6 right-6 z-50 h-14 w-14 rounded-full bg-white/90 backdrop-blur-md shadow-xl hover:bg-stone-100/90 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        onClick={() => {
          openDrawer();
        }}
      >
        <ShoppingCart className="h-6 w-6 text-stone-800" />
        <CartCounter />
      </Button>
       <CartDrawer open={isDrawerOpen} onOpenChange={closeDrawer} />
      
    </>
  );
}
