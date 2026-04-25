import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/PageShell';
import BookFlipCard from '@/components/BookFlipCard';
import { searchGoogleBooks, searchGoogleBooksByGenre, getLocalHistory, type Book } from '@/lib/api';
import { getInteractionHistory, type InteractionHistory } from '@/lib/tracking';
import { RefreshCw, Loader2 } from 'lucide-react';

const GENRES = ['Fiction', 'Science Fiction', 'Fantasy', 'History', 'Technology', 'Romance', 'Mystery', 'Biography', 'Poetry', 'Psychology'];

const RecommendPage = () => {
  const [history, setHistory] = useState<InteractionHistory>({ genreCount: {}, clickedBooks: [], searchHistory: [] });
  const [genreBooks, setGenreBooks] = useState<Book[]>([]);
  const [ratedBooks, setRatedBooks] = useState<Book[]>([]);
  const [personalBooks, setPersonalBooks] = useState<Book[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('Fiction');
  const [selectedRatedGenre, setSelectedRatedGenre] = useState('Fiction');
  const [loading, setLoading] = useState({ genre: false, rated: false, personal: false });

  useEffect(() => {
    // Initial load
    const h = getInteractionHistory();
    setHistory(h);
  }, []);

  const fetchGenre = async () => {
    setLoading((p) => ({ ...p, genre: true }));
    const randomOffset = Math.floor(Math.random() * 40);
    const books = await searchGoogleBooksByGenre(selectedGenre, randomOffset);
    // Simulate Random Forest: pick 3 random from top results
    const shuffled = books.sort(() => 0.5 - Math.random());
    setGenreBooks(shuffled.slice(0, 3));
    setLoading((p) => ({ ...p, genre: false }));
  };

  const fetchRated = async () => {
    setLoading((p) => ({ ...p, rated: true }));
    // Fetch books based on selected genre, offset randomly to guarantee new books
    const randomOffset = Math.floor(Math.random() * 30); 
    const books = await searchGoogleBooksByGenre(selectedRatedGenre, randomOffset);
    const sorted = books.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    const topRated = sorted.slice(0, 10);
    const shuffledTop = topRated.sort(() => 0.5 - Math.random());
    setRatedBooks(shuffledTop.slice(0, 3));
    setLoading((p) => ({ ...p, rated: false }));
  };

  const fetchPersonal = async () => {
    setLoading((p) => ({ ...p, personal: true }));
    
    const h = getInteractionHistory();
    setHistory(h);
    
    console.log("History:", h);

    const genres = Object.keys(h.genreCount);
    const topGenre = genres.length > 0 
      ? genres.reduce((a, b) => h.genreCount[a] > h.genreCount[b] ? a : b)
      : null;
    
    console.log("Top Genre:", topGenre);

    if (topGenre) {
      const randomOffset = Math.floor(Math.random() * 40);
      const books = await searchGoogleBooksByGenre(topGenre, randomOffset);
      // Filter out already clicked and already read books
      const clickedTitles = new Set(h.clickedBooks.map(b => b.title.toLowerCase()));
      const localHistory = getLocalHistory();
      const filtered = books.filter(b => {
        const historyItem = localHistory.find(hb => hb.title === b.title);
        const isRead = historyItem?.status === 'read';
        return !clickedTitles.has(b.title.toLowerCase()) && !isRead;
      });
      
      // Add some variety/random books
      const varietyOffset = Math.floor(Math.random() * 20);
      const otherBooks = await searchGoogleBooks('best sellers', varietyOffset);
      const variety = otherBooks.filter(b => b.genre !== topGenre).slice(0, 2);
      
      const recommended = [...filtered.slice(0, 3), ...variety];
      console.log("Recommended:", recommended);
      setPersonalBooks(recommended);
    } else {
      const books = await searchGoogleBooks('classic novels');
      setPersonalBooks(books.slice(0, 3));
    }
    setLoading((p) => ({ ...p, personal: false }));
  };

  const [activeTab, setActiveTab] = useState<'genre' | 'rated' | 'personal'>('genre');

  useEffect(() => {
    if (activeTab === 'personal') {
      fetchPersonal();
    }
  }, [activeTab]);

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl tracking-tighter text-foreground">Recommend Books</h1>
            <p className="text-muted-foreground mt-2 font-body">Discover your next great read with our recommendation engines</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-widest font-body ml-1">Engine Select</label>
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="bg-card border border-border/50 text-foreground px-4 py-2 rounded-xl text-sm font-body outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer backdrop-blur-xl"
            >
              <option value="genre">Genre Based (Random Forest)</option>
              <option value="rated">Highest Rated by Genre</option>
              <option value="personal">Personalized (Based on History)</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'genre' && (
            <motion.section 
              key="genre"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl tracking-tight text-foreground">Genre Based <span className="text-sm text-muted-foreground font-body ml-2">(Random Forest)</span></h2>
                <button onClick={fetchGenre} disabled={loading.genre} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-body hover:opacity-90 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${loading.genre ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {GENRES.map((g) => (
                  <button key={g} onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${selectedGenre === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {g}
                  </button>
                ))}
              </div>
              {loading.genre ? <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" /> : (
                <div className="flex flex-wrap gap-8 justify-center min-h-[350px]">
                  {genreBooks.map((b, i) => <BookFlipCard key={i} book={b} />)}
                  {!loading.genre && genreBooks.length === 0 && <p className="text-center text-muted-foreground text-sm font-body my-auto">Explore different genres and click Refresh to generate recommendations</p>}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'rated' && (
            <motion.section 
              key="rated"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl tracking-tight text-foreground">Highest Rated by Genre</h2>
                <button onClick={fetchRated} disabled={loading.rated} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-body hover:opacity-90 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${loading.rated ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {GENRES.map((g) => (
                  <button key={g} onClick={() => setSelectedRatedGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${selectedRatedGenre === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {g}
                  </button>
                ))}
              </div>
              {loading.rated ? <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" /> : (
                <div className="flex flex-wrap gap-8 justify-center min-h-[350px]">
                  {ratedBooks.map((b, i) => <BookFlipCard key={i} book={b} />)}
                  {!loading.rated && ratedBooks.length === 0 && <p className="text-center text-muted-foreground text-sm font-body my-auto">Select a genre and click Refresh to see top rated books</p>}
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'personal' && (
            <motion.section 
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl tracking-tight text-foreground">Personalized Recommendations</h2>
                <button onClick={fetchPersonal} disabled={loading.personal} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-body hover:opacity-90 disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${loading.personal ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              {loading.personal ? <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" /> : (
                <div className="flex flex-col items-center gap-8 min-h-[350px]">
                  {Object.keys(history.genreCount).length > 0 && (
                    <p className="text-sm text-primary font-body bg-primary/10 px-4 py-1.5 rounded-full">
                      Based on your interest in {Object.keys(history.genreCount).reduce((a, b) => history.genreCount[a] > history.genreCount[b] ? a : b)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-8 justify-center">
                    {personalBooks.map((b, i) => <BookFlipCard key={i} book={b} />)}
                  </div>
                  {!loading.personal && personalBooks.length === 0 && (
                    <div className="text-center my-auto">
                      <p className="text-muted-foreground text-sm font-body">Start exploring books to get personalized recommendations</p>
                      <button onClick={fetchPersonal} className="text-primary hover:underline text-xs mt-2">Generate Recommendations</button>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
};

export default RecommendPage;
