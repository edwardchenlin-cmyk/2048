import React from 'react';

interface TileProps {
  value: number;
}

const Tile: React.FC<TileProps> = ({ value }) => {
  // Helper to get color based on value
  const getColors = (val: number) => {
    switch (val) {
      case 2: return 'bg-[#eee4da] text-[#776e65]';
      case 4: return 'bg-[#ede0c8] text-[#776e65]';
      case 8: return 'bg-[#f2b179] text-white';
      case 16: return 'bg-[#f59563] text-white';
      case 32: return 'bg-[#f67c5f] text-white';
      case 64: return 'bg-[#f65e3b] text-white';
      case 128: return 'bg-[#edcf72] text-white text-3xl';
      case 256: return 'bg-[#edcc61] text-white text-3xl shadow-[0_0_30px_10px_rgba(237,204,97,0.4)]';
      case 512: return 'bg-[#edc850] text-white text-3xl shadow-[0_0_30px_10px_rgba(237,200,80,0.5)]';
      case 1024: return 'bg-[#edc53f] text-white text-2xl shadow-[0_0_30px_10px_rgba(237,197,63,0.5)]';
      case 2048: return 'bg-[#edc22e] text-white text-2xl shadow-[0_0_30px_10px_rgba(237,194,46,0.6)]';
      default: return 'bg-[#3c3a32] text-white text-xl'; // Super high numbers
    }
  };

  const baseClasses = "w-full h-full rounded-md flex justify-center items-center font-bold transition-all duration-200 transform select-none";
  const fontSize = value > 512 ? 'text-3xl' : 'text-4xl';
  
  if (value === 0) {
    return <div className="w-full h-full rounded-md bg-[#cdc1b4]/50"></div>;
  }

  return (
    <div className={`${baseClasses} ${getColors(value)} animate-pop`}>
      {value}
    </div>
  );
};

export default Tile;