"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const fallback = [
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85",
];

interface PackageGalleryProps {
  images?: string[];
  alt: string;
}

export function PackageGallery({ images = fallback, alt }: PackageGalleryProps) {
  const gallery = images.length > 0 ? images : fallback;
  const main = gallery[0];
  const thumbs = (gallery.length > 1 ? gallery.slice(1) : fallback.slice(1)).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="grid gap-3 sm:grid-cols-[1.6fr,1fr] lg:gap-4"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-card lg:aspect-[16/10]">
        <Image
          src={main}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-[2s] hover:scale-105"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        {thumbs.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className="relative aspect-square w-full overflow-hidden rounded-xl shadow-card"
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-[2s] hover:scale-105"
            />
            {index === thumbs.length - 1 && gallery.length > 5 && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-[2px]"
                aria-hidden
              >
                <span className="rounded-full bg-white/90 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-navy shadow-card">
                  +{gallery.length - 5} More
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
