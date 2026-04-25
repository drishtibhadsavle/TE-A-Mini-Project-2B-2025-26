import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/PageShell';
import BookFlipCard from '@/components/BookFlipCard';
import { detectBooks, searchGoogleBooksByGenre, saveToHistory, type Book, type DetectionResult } from '@/lib/api';
import { Upload, Loader2 } from 'lucide-react';

const GENRES = ['Fiction', 'Science Fiction', 'Fantasy', 'History', 'Technology', 'Romance', 'Mystery', 'Biography', 'Self-Help', 'Philosophy', 'Poetry', 'Psychology'];

const SnapShelfPage = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    setSelectedGenre('');
    setFilteredBooks([]);
    try {
      const data = await detectBooks(file);
      setResult(data);
      // Save to history
      data.books.forEach((book) => saveToHistory(book));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGenreFilter = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre('');
      setFilteredBooks([]);
      return;
    }
    setSelectedGenre(genre);
    if (result && result.books) {
      const filtered = result.books.filter(b => 
        b.genre && b.genre.toLowerCase().includes(genre.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-4xl tracking-tighter text-foreground">SnapShelf Detection</h1>
          <p className="text-muted-foreground mt-2 font-body">Upload a bookshelf image to detect and identify your books</p>
        </div>

        {/* Upload */}
        <label className="glass-panel p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
          <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
          <span className="text-sm text-muted-foreground font-body group-hover:text-foreground transition-colors">
            Click to upload a bookshelf image
          </span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-muted-foreground font-body">Detecting books...</span>
          </div>
        )}

        {result && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Summary */}
              <div className="glass-panel p-6 border-b-0 rounded-b-none">
                <h2 className="text-2xl tracking-tight text-foreground mb-2 uppercase">Your Shelf Contains</h2>
                <p className="text-primary text-lg font-body font-semibold">
                  TOTAL BOOKS DETECTED: {result.total_books_detected}
                </p>
              </div>

              {/* Detection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.books.map((book, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-5"
                  >
                    <div className="text-xs text-primary uppercase tracking-widest font-body mb-3">
                      BOOK {i + 1}/{result.total_books_detected}
                    </div>
                    <div className="space-y-1 font-body text-sm">
                      <p><span className="text-muted-foreground uppercase">EXTRACTED TEXT:</span> <span className="text-foreground">{book.extracted_text || 'Unknown'}</span></p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Book Cards */}
              <div>
                <h2 className="text-2xl tracking-tight text-foreground mb-6">Detected Books</h2>
                <div className="flex flex-wrap gap-8 justify-center">
                  {result.books.map((book, i) => (
                    <BookFlipCard key={i} book={book} />
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div className="glass-panel p-6">
                <h2 className="text-2xl tracking-tight text-foreground mb-4">Filter by Genre</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreFilter(genre)}
                      className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
                        selectedGenre === genre
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {filterLoading && <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />}
                {filteredBooks.length > 0 && (
                  <div className="flex flex-wrap gap-8 justify-center">
                    {filteredBooks.map((book, i) => (
                      <BookFlipCard key={i} book={book} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </PageShell>
  );
};

export default SnapShelfPage;
