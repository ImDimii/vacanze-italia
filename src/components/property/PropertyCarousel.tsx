'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PropertyCarouselProps {
  images: string[];
}

export function PropertyCarousel({ images }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative group w-full bg-bg-primary rounded-2xl overflow-hidden shadow-inner">
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`Property ${currentIndex}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Gallery Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="rounded-full bg-black/50 text-white hover:bg-black/70 shadow-2xl backdrop-blur-md h-12 w-12 border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="rounded-full bg-black/50 text-white hover:bg-black/70 shadow-2xl backdrop-blur-md h-12 w-12 border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Action Controls Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
           <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-white shadow-xl">
             {currentIndex + 1} / {images.length}
           </div>
           
           <button
             onClick={() => setIsLightboxOpen(true)}
             className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-5 py-2.5 font-bold text-[10px] uppercase tracking-widest text-white flex items-center gap-2 transition-all hover:bg-white hover:text-black shadow-xl"
           >
             <Maximize2 className="w-3.5 h-3.5" /> Espandi
           </button>
        </div>
      </div>

      {/* Modern Thumbnail Strip */}
      <div className="h-24 bg-bg-surface/50 border-t border-border p-4 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth" ref={scrollRef}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "relative flex-shrink-0 w-28 h-full rounded-lg overflow-hidden border-2 transition-all",
              currentIndex === i ? "border-accent-gold scale-105" : "border-transparent opacity-50 hover:opacity-100"
            )}
          >
            <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox Implementation */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-screen h-screen m-0 p-0 bg-black/95 border-none flex items-center justify-center">
            <div className="relative w-full h-full p-4 md:p-16">
               <Image src={images[currentIndex]} alt="View Fullsize" fill className="object-contain" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-8 right-8 text-white hover:bg-white/10 h-12 w-12"
              onClick={() => setIsLightboxOpen(false)}
            >
              Cura
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
