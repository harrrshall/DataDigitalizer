import React, { useState, useEffect } from 'react';

interface SVGItem {
  title: string;
  content: string;
}

const svgs: SVGItem[] = [
  {
    title: "From pen strokes to spreadsheets, in the blink of an eye.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <path d="M20 100 Q 60 20, 100 100 T 180 100" stroke="#333" fill="none" stroke-width="4"/>
      <rect x="120" y="120" width="60" height="60" fill="#4CAF50" rx="10"/>
      <text x="130" y="160" fill="white" font-family="Arial" font-size="20">CSV</text>
      <path d="M100 100 L 120 150" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
    </svg>`
  },
  {
    title: "Transforming scribbles into digital data, effortlessly.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#e0e0e0"/>
      <rect x="20" y="40" width="80" height="120" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M30 60 L 90 60 M30 80 L 90 80 M30 100 L 90 100" stroke="#666" stroke-width="1"/>
      <path d="M120 80 L 180 80 L 180 160 L 100 160 L 100 90 Z" fill="#4CAF50"/>
      <rect x="110" y="90" width="60" height="40" fill="#fff"/>
      <text x="120" y="115" fill="#333" font-family="Arial" font-size="14">CSV</text>
      <path d="M90 100 L 120 110" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
    </svg>`
  },
  {
    title: "Capture your notes, digitize your thoughts.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#d0d0d0"/>
      <circle cx="50" cy="100" r="40" fill="#333"/>
      <circle cx="50" cy="100" r="35" fill="#4CAF50"/>
      <rect x="30" y="70" width="40" height="60" fill="#fff" rx="5"/>
      <path d="M40 80 L 60 80 M40 90 L 60 90 M40 100 L 60 100" stroke="#666" stroke-width="1"/>
      <rect x="120" y="60" width="60" height="80" fill="#333" rx="5"/>
      <rect x="125" y="65" width="50" height="60" fill="#fff"/>
      <text x="135" y="100" fill="#333" font-family="Arial" font-size="14">CSV</text>
      <path d="M90 100 L 120 100" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
    </svg>`
  },
  {
    title: "Bridging the gap between paper and pixels.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#e8e8e8"/>
      <path d="M30 170 L 50 50 L 70 170" fill="#4CAF50" stroke="#333" stroke-width="2"/>
      <path d="M40 60 Q 60 40, 80 60" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="100" y="120" width="80" height="40" fill="#333" rx="5"/>
      <rect x="105" y="125" width="10" height="10" fill="#fff" rx="2"/>
      <rect x="120" y="125" width="10" height="10" fill="#fff" rx="2"/>
      <rect x="135" y="125" width="10" height="10" fill="#fff" rx="2"/>
      <rect x="150" y="125" width="25" height="10" fill="#fff" rx="2"/>
      <path d="M70 100 L 100 140" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
    </svg>`
  },
  {
    title: "Your handwriting, our technology, endless possibilities.",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f8f8f8"/>
      <path d="M20 100 L 80 60 L 80 140 Z" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M30 100 L 70 80" stroke="#666" stroke-width="1"/>
      <path d="M140 80 Q 160 60, 180 80 Q 200 100, 180 120 Q 160 140, 140 120 Q 120 100, 140 80" fill="#4CAF50"/>
      <text x="150" y="110" fill="#fff" font-family="Arial" font-size="20">CSV</text>
      <path d="M80 100 Q 110 90, 140 100" stroke="#333" stroke-width="2" fill="none" stroke-dasharray="5,5"/>
    </svg>`
  }
];

const Randomsvgplaceholder = () => {
  const [selectedSVG, setSelectedSVG] = useState<SVGItem | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * svgs.length);
    setSelectedSVG(svgs[randomIndex]);
  }, []);

  if (!selectedSVG) return null;

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div dangerouslySetInnerHTML={{ __html: selectedSVG.content }} />
      <p className="text-sm text-center mt-2 text-gray-600">{selectedSVG.title}</p>
    </div>
  );
};

export default Randomsvgplaceholder;