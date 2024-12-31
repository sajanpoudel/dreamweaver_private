export function FallingStars() {
  return (
    <>
      {/* Top right corner stars - Diagonal falling */}
      <div className="absolute top-0 right-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStars1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '5%', right: '15%' }} />
        <div className="animate-fallingStars2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '20%', right: '35%' }} />
        <div className="animate-fallingStars3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '8%', right: '45%' }} />
      </div>

      {/* Top left corner stars - Vertical falling */}
      <div className="absolute top-0 left-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsVertical1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '5%', left: '15%' }} />
        <div className="animate-fallingStarsVertical2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '20%', left: '35%' }} />
        <div className="animate-fallingStarsVertical3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '8%', left: '45%' }} />
      </div>

      {/* Bottom right corner stars - Spiral pattern */}
      <div className="absolute bottom-0 right-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsSpiral1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '5%', right: '15%' }} />
        <div className="animate-fallingStarsSpiral2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '20%', right: '35%' }} />
        <div className="animate-fallingStarsSpiral3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '8%', right: '45%' }} />
      </div>

      {/* Bottom left corner stars - Zigzag pattern */}
      <div className="absolute bottom-0 left-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsZigzag1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '5%', left: '15%' }} />
        <div className="animate-fallingStarsZigzag2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '20%', left: '35%' }} />
        <div className="animate-fallingStarsZigzag3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '8%', left: '45%' }} />
      </div>
    </>
  );
} 