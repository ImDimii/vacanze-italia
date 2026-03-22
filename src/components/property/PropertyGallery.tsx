'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Grid, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertyGallery({ images }: { images: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden group">
        <div className={cn(
          "grid gap-2 h-[400px] md:h-[500px]",
          displayImages.length === 1 ? "grid-cols-1" : 
          displayImages.length === 2 ? "grid-cols-2" : 
          displayImages.length === 3 ? "grid-cols-2 lg:grid-cols-3" :
          displayImages.length >= 4 ? "grid-cols-2 md:grid-cols-4 grid-rows-2" : ""
        )}>
          {/* Main Large Image */}
          <div 
            className={cn(
              "relative cursor-pointer hover:opacity-90 transition-opacity",
              displayImages.length >= 4 ? "col-span-2 row-span-2" : "col-span-1 h-full"
            )}
            onClick={() => openLightbox(0)}
          >
            <Image 
              src={displayImages[0]} 
              alt="Immagine principale" 
              fill 
              className="object-cover" 
            />
          </div>

          {/* Additional Images */}
          {displayImages.slice(1, 5).map((img, i) => (
            <div 
              key={i} 
              className={cn(
                "relative cursor-pointer hover:opacity-90 transition-opacity hidden md:block",
                displayImages.length >= 4 ? "col-span-1 row-span-1" : "col-span-1 h-full"
              )}
              onClick={() => openLightbox(i + 1)}
            >
              <Image 
                src={img} 
                alt={`Immagine ${i + 2}`} 
                fill 
                className="object-cover" 
              />
            </div>
          ))}
        </div>

        {images.length > 5 && (
          <Button 
            variant="secondary"
            className="absolute bottom-4 right-4 bg-white/90 text-black hover:bg-white z-10 font-medium"
            onClick={() => openLightbox(0)}
          >
            <Grid className="w-4 h-4 mr-2" />
            Mostra tutte le {images.length} foto
          </Button>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] m-0 p-0 border-none bg-black/95 flex items-center justify-center pt-0 pb-0 gap-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full bg-black/50"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 rounded-full w-12 h-12 bg-black/50"
            onClick={prevImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <Image 
              src={images[currentIndex]} 
              alt={`Foto ${currentIndex + 1}`} 
              fill
              className="object-contain"
            />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 rounded-full w-12 h-12 bg-black/50"
            onClick={nextImage}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
