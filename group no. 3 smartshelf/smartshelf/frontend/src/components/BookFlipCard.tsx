import React, { useState, useRef, useCallback, useMemo } from 'react';
import { saveToHistory, type Book } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ChevronLeft, Bookmark, BookmarkPlus } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { isBookSaved, saveBook, unsaveBook } from '@/lib/favorites';
import { trackClick } from '@/lib/tracking';

interface BookFlipCardProps {
  book: Book;
  onClickAction?: (book: Book) => void;
}

// Separate Page component required for react-pageflip (must use forwardRef)
const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  (props, ref) => {
    return (
      <div className="page bg-[#fdf6e3] shadow-sm" ref={ref}>
        <div className="page-content h-full w-full flex flex-col p-12">
          <div className="page-hinge-shadow" />
          {props.children}
        </div>
      </div>
    );
  }
);

const BookFlipCard = ({ book, onClickAction }: BookFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [saved, setSaved] = useState(isBookSaved(book.title));
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playFlipSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/page-flip-01a.mp3');
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const pages = useMemo(() => {
    const p = [
      { 
        id: 1, 
        title: "Summary", 
        content: book.description || 'No description available for this classic text.' 
      },
      { 
        id: 2, 
        title: "Details", 
        content: (
          <div className="space-y-6">
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-[#8D6E63] font-sans font-bold mb-1">Primary Genre</span>
              <span className="text-base font-serif text-[#3E2723]">{book.genre || 'General Fiction'}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-[#8D6E63] font-sans font-bold mb-1">Average Rating</span>
              <span className="text-base font-serif text-[#3E2723]">★ {book.rating || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-[#8D6E63] font-sans font-bold mb-1">Author</span>
              <span className="text-base font-serif text-[#3E2723] font-bold italic">{book.author}</span>
            </div>
          </div>
        ) 
      }
    ];

    if (book.pageCount || (book.language && book.language !== 'en')) {
      p.push({ 
        id: 3, 
        title: "Additional Info", 
        content: (
          <div className="space-y-5">
            <p className="text-[14px] font-serif leading-relaxed text-[#5D4037]">Technical metadata and bibliographic details retrieved from the Google Books repository.</p>
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#8D6E63]/20">
              {book.language && (
                <div>
                  <span className="block text-[10px] uppercase text-[#8D6E63] mb-1">Language</span>
                  <span className="text-sm font-serif uppercase tracking-tight">{book.language}</span>
                </div>
              )}
              {book.pageCount && (
                <div>
                  <span className="block text-[10px] uppercase text-[#8D6E63] mb-1">Page Count</span>
                  <span className="text-sm font-serif">{book.pageCount} pages</span>
                </div>
              )}
            </div>
          </div>
        ) 
      });
    }
    return p;
  }, [book]);

  const onFlip = useCallback((e: any) => {
    playFlipSound();
  }, []);

  const prev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      saveToHistory(book);
      trackClick(book);
      if (onClickAction) onClickAction(book);
    }
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      unsaveBook(book.title);
      setSaved(false);
      toast.info(`Removed ${book.title} from collection`);
    } else {
      saveBook(book);
      setSaved(true);
      toast.success(`Saved ${book.title} to collection`);
    }
  };

  return (
    <div className={`book-container group ${isFlipped ? 'expanded' : ''}`} onClick={handleClick}>
      <div 
        className="book transition-transform duration-700" 
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}
      >
        <div className="front">
          <div className="cover">
            {book.image ? (
              <img src={book.image} alt={book.title} />
            ) : (
              <div className="w-full h-full bg-[#5D4037]/20 flex items-center justify-center p-4">
                <span className="text-[#C1A87D] text-xs text-center font-serif">{book.title}</span>
              </div>
            )}
            <div className="book-title-overlay text-[#E8DCC4] font-serif">{book.title}</div>
            {book.rating && book.rating !== 'N/A' && (
              <div className="book-rating-badge bg-[#8D6E63] text-[#F3E5AB]">★ {book.rating}</div>
            )}
            
            <div className="absolute top-2 right-2 z-20">
              <button 
                onClick={toggleSave}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${saved ? 'bg-blue-500/80 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-black/20 text-[#C1A87D] hover:bg-black/40'}`}
                title={saved ? "Remove from Collection" : "Save to Collection"}
              >
                {saved ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
              </button>
            </div>

            {saved && (
              <div className="absolute bottom-2 left-2 animate-in fade-in slide-in-from-bottom-1 duration-500">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" title="Saved" />
              </div>
            )}
          </div>
        </div>
        
        <div className="left-side bg-[#3E2723]">
          <h2 className="p-8 text-center"><span className="text-[#8D6E63] font-serif transition-colors duration-300 group-hover:text-[#F3E5AB]">{book.title}</span></h2>
        </div>

        <div className="back bg-[#2E1D13] border border-[#5D4037]/30 p-0 overflow-visible">
          <div className="perspective-container h-full w-full">
            {isFlipped && (
              <HTMLFlipBook
                width={850}
                height={500}
                size="fixed"
                {...({ display: 'single', minWidth: 850, maxWidth: 850, minHeight: 500, maxHeight: 500 } as any)}
                maxShadowOpacity={0.3}
                showCover={false}
                mobileScrollSupport={true}
                onFlip={onFlip}
                className="book-flip"
                ref={flipBookRef}
                style={{ width: '100%', height: '100%', background: 'transparent' }}
                startPage={0}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={true}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={60}
                showPageCorners={true}
                disableFlipByClick={false}
              >
                {pages.map((page, i) => (
                  <Page key={i}>
                    <div className="flex justify-between items-center mb-6 border-b border-[#8D6E63]/20 pb-3">
                      <h3 className="text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-[#8D6E63]">{page.title}</h3>
                      <span className="text-[11px] font-serif text-[#8D6E63]/60">{i + 1} / {pages.length}</span>
                    </div>
                    <div className="description-container flex-1 overflow-y-auto pr-4 font-serif text-[#3E2723] text-base leading-relaxed">
                      {typeof page.content === 'string' ? <p>{page.content}</p> : page.content}
                    </div>
                  </Page>
                ))}
              </HTMLFlipBook>
            )}

            {isFlipped && (
              <div className="absolute bottom-10 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                <button 
                  onClick={prev} 
                  className="px-6 py-2.5 bg-[#3E2723] text-[#F3E5AB] text-xs font-serif rounded-full shadow-xl hover:bg-[#5D4037] transition-all transform hover:scale-105 active:scale-95 pointer-events-auto flex items-center gap-2 border border-[#8D6E63]/30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              </div>
            )}
            
            {book.infoLink && isFlipped && (
              <div className="absolute top-8 right-8 z-[100]">
                <a href={book.infoLink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#8D6E63] hover:text-[#3E2723] underline transition-colors font-serif bg-[#fdf6e3]/90 px-3 py-1.5 rounded-md shadow-sm border border-[#8D6E63]/10" onClick={(e) => e.stopPropagation()}>View on Google Books ↗</a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookFlipCard;
