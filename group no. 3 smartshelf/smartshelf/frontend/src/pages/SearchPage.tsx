import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import BookFlipCard from '@/components/BookFlipCard';
import { searchGoogleBooks, type Book } from '@/lib/api';
import { trackSearch } from '@/lib/tracking';
import { Loader2 } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const books = await searchGoogleBooks(query);
        setResults(books);
        trackSearch(query);
      } catch (err) {
        console.error('Search failed', err);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif tracking-wide text-[#F3E5AB]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Search Results
          </h1>
          <p className="text-[#E8DCC4] mt-2 font-serif italic">
            {query ? `Showing results for "${query}"` : 'Enter a search term in the navigation bar'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="w-8 h-8 text-[#C1A87D] animate-spin" />
            <span className="text-[#E8DCC4] font-serif text-lg">Searching the archives...</span>
          </div>
        ) : (
          <div className="glass-panel p-8">
            {results.length > 0 ? (
              <div className="flex flex-wrap gap-8 justify-center">
                {results.map((book, i) => (
                  <BookFlipCard key={i} book={book} />
                ))}
              </div>
            ) : (
              query && (
                <div className="text-center py-12 text-[#C1A87D] font-serif italic text-lg">
                  No books found in our records for "{query}".
                </div>
              )
            )}
          </div>
        )}
      </motion.div>
    </PageShell>
  );
};

export default SearchPage;
