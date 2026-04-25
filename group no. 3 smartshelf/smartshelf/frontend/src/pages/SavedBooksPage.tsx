import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/PageShell';
import BookFlipCard from '@/components/BookFlipCard';
import { getSavedBooks } from '@/lib/favorites';
import { type Book } from '@/lib/api';
import { Bookmark, Library } from 'lucide-react';

const SavedBooksPage = () => {
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);

  useEffect(() => {
    setSavedBooks(getSavedBooks());
  }, []);

  const refreshList = () => {
    setSavedBooks(getSavedBooks());
  };

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl tracking-tighter text-foreground flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              My Saved Collection
            </h1>
            <p className="text-muted-foreground mt-2 font-body">Books you've saved for later reading</p>
          </div>
          
          <div className="bg-primary/10 px-6 py-2.5 rounded-2xl border border-primary/20 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary fill-current" />
            <span className="text-sm font-body text-primary font-bold">{savedBooks.length} Books Saved</span>
          </div>
        </div>

        <section className="glass-panel p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {savedBooks.length > 0 ? (
                <div className="flex flex-wrap gap-10 justify-center md:justify-start">
                  {savedBooks.map((book, i) => (
                    <BookFlipCard key={`${book.title}-${i}`} book={book} onClickAction={refreshList} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <Bookmark className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-serif text-foreground">Your collection is empty</h3>
                  <p className="text-muted-foreground font-body mt-2 max-w-xs">Start exploring and save the books you're interested in.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </motion.div>
    </PageShell>
  );
};

export default SavedBooksPage;
