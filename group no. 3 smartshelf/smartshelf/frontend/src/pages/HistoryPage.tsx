import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import BookFlipCard from '@/components/BookFlipCard';
import { getHistory, updateHistoryStatus, type Book } from '@/lib/api';
import { BookOpen, Loader2, CheckCircle2, Circle, Filter } from 'lucide-react';
import { toast } from 'sonner';

const HistoryPage = () => {
  const [history, setHistory] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  const refreshHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  useEffect(() => {
    refreshHistory().then(() => setLoading(false));
  }, []);

  const toggleStatus = async (book: Book) => {
    const currentStatus = book.status || 'unread';
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';
    updateHistoryStatus(book.title, newStatus);
    await refreshHistory();
    toast.success(`Marked "${book.title}" as ${newStatus}`);
  };

  const filteredHistory = history.filter(book => {
    const bookStatus = book.status || 'unread';
    if (filter === 'all') return true;
    return bookStatus === filter;
  });

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-4xl tracking-tighter text-[#F3E5AB] font-serif" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Reading History</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <p className="text-[#C1A87D] font-serif italic text-lg opacity-80">All books you've detected or explored</p>
            
            <div className="flex items-center gap-1 bg-[#2D1B18]/60 p-1.5 rounded-full border border-[#5D4037]/40 backdrop-blur-xl shadow-2xl">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8D6E63] font-black px-4 py-1">Filter</span>
              {(['all', 'read', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-serif capitalize transition-all duration-300 ${filter === f ? 'bg-[#8D6E63] text-[#F3E5AB] shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-105' : 'text-[#C1A87D]/70 hover:text-[#E8DCC4] hover:bg-white/5'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#C1A87D] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="vintage-panel p-16 text-center">
            <BookOpen className="w-12 h-12 text-[#8D6E63] mx-auto mb-4" />
            <p className="text-[#E8DCC4] font-serif text-lg">Your library is currently empty. Use SnapShelf to detect books!</p>
          </div>
        ) : (
          <div className="vintage-panel p-8 min-h-[400px]">
            {filteredHistory.length > 0 ? (
              <div className="flex flex-wrap gap-8 justify-center">
                {filteredHistory.map((book, i) => (
                  <motion.div
                    key={`${book.title}-${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <div className={`transition-opacity duration-300 ${book.status === 'read' ? 'opacity-60 grayscale-[0.3]' : 'opacity-100'}`}>
                      <BookFlipCard book={book} />
                    </div>
                    
                    <button 
                      onClick={() => toggleStatus(book)}
                      className={`absolute top-4 left-4 z-[60] flex items-center gap-2 p-2 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-xl ${book.status === 'read' ? 'bg-green-600 border-green-500 text-white' : 'bg-[#3E2723]/60 border-[#5D4037] text-[#C1A87D] hover:bg-[#8D6E63] hover:text-[#F3E5AB]'}`}
                      title={book.status === 'read' ? "Mark as Unread" : "Mark as Read"}
                    >
                      {book.status === 'read' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider pr-2 hidden group-hover:block">{book.status === 'read' ? 'Read' : 'Mark Read'}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Filter className="w-12 h-12 text-[#8D6E63] mx-auto mb-4 opacity-30" />
                <p className="text-[#C1A87D] font-serif text-lg italic">No {filter} books in your history.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </PageShell>
  );
};

export default HistoryPage;
