"use client"

export function FloatingActionButton() {
  return (
    <aside aria-label="Floating WhatsApp & Chat Widget">
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#A5AF79] hover:bg-[#949e6a] active:bg-[#838d5c] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#A5AF79]/40 cursor-pointer"
        aria-label="Chat with us on WhatsApp"
        onClick={() => {
          window.open("https://wa.me/6285159922661", "_blank", "noopener,noreferrer")
        }}
      >
        {/* Placeholder Chat Circle Indicator */}
        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center relative">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#A5AF79] border-r-2 border-b-2 border-white rotate-45" />
        </div>
        {/* Soft pulse indicator */}
        <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A07C] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E8A07C]"></span>
        </span>
      </button>
    </aside>
  )
}
