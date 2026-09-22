import React, { useState, useEffect } from 'react';
import { FaBolt } from 'react-icons/fa';

const HomeMarquee = () => {
  const [text, setText] = useState('SPECIAL DIWALI OFFER: GET UPTO 50% OFF ON ALL BULK ORDERS! LIMITED TIME ONLY.');

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/cms/home');
        const data = await response.json();
        if (data.success && data.data.marquee_text) {
          setText(data.data.marquee_text);
        }
      } catch (err) {
        console.error('Failed to fetch marquee:', err);
      }
    };
    fetchCMS();
  }, []);

  const RepeatedContent = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-6 text-sm font-semibold tracking-wide flex items-center shrink-0">
          <FaBolt className="text-[#F8B400] mr-2 text-base animate-pulse" />
          {text}
        </span>
      ))}
    </>
  );

  return (
    <div className="bg-[#C70E17] text-white py-3 overflow-hidden relative border-y border-red-900/40 shadow-inner">
      <div className="flex w-full whitespace-nowrap hover:[animation-play-state:paused]">
        <div className="flex animate-marquee shrink-0">
          <RepeatedContent />
        </div>
        <div className="flex animate-marquee shrink-0" aria-hidden="true">
          <RepeatedContent />
        </div>
      </div>
    </div>
  );
};

export default HomeMarquee;
