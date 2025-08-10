

import { useTranslation } from "react-i18next";
import bannerData from "@/data/banner-carousel.json";
import { useState } from "react";

type Banner = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  button?: {
    text: string;
    href: string;
  };
  order?: number;
  likeCount?: number;
  isActive?: boolean;
};

export default function BannerCarousel() {
  const { t } = useTranslation();
  // Filter active banners and sort by order
  const banners: Banner[] = Array.isArray(bannerData)
    ? (bannerData as Banner[]).filter((b: Banner) => b.isActive).sort((a: Banner, b: Banner) => (a.order ?? 0) - (b.order ?? 0))
    : [bannerData as Banner];

  const [current, setCurrent] = useState(0);
  const banner = banners[current] || banners[0];

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="relative mb-12 group">
      <div className="relative h-48 md:h-72 lg:h-96 w-full rounded-2xl overflow-hidden">
        {/* Border with gradient */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-red-200 via-white to-blue-200">
          <div className="relative w-full h-full rounded-2xl bg-white overflow-hidden">
            {/* Wider shimmer overlay */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -skew-x-12 transform -translate-x-full group-hover:translate-x-[200%]"></div>
            </div>
            {/* Banner Image */}
            <div className="absolute inset-0">
              <img 
                src={banner.imageUrl}
                alt={banner.imageAlt}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-700/40 to-transparent"></div>
            </div>
            {/* Banner Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {t(banner.title, 'Your Voice Matters')}
              </h1>
              {banner.subtitle && (
                <p className="text-white/90 mt-4 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
                  {t(banner.subtitle, 'Participate in the democratic process and make your vote count')}
                </p>
              )}
              {banner.button && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <a
                    href={banner.button.href}
                    className="relative inline-flex items-center justify-center px-6 py-3 rounded-full font-medium text-base bg-gradient-to-r from-red-50 via-white to-blue-50 border-2 border-transparent hover:from-red-100 hover:to-blue-100 transition-colors shadow group"
                  >
                    {/* Red dot left */}
                    <span className="absolute left-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    <span className="mx-3 text-nepal-red z-10">{t(banner.button.text, 'Vote Now')}</span>
                    {/* Blue dot right */}
                    <span className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Banner Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {banners.length > 1
            ? banners.map((b, idx) => (
                <button
                  key={b.id}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${idx === current ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => goTo(idx)}
                />
              ))
            : (
                <button
                  className="w-2 h-2 rounded-full bg-white"
                  aria-label="Only one banner"
                  disabled
                />
              )}
        </div>
        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-nepal-red p-2 rounded-full shadow-lg z-10"
              aria-label="Previous slide"
              onClick={prev}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-nepal-red p-2 rounded-full shadow-lg z-10"
              aria-label="Next slide"
              onClick={next}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
