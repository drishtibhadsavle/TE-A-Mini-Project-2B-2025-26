import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import { Camera, BookOpen, Star } from 'lucide-react';
import React from 'react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <PageShell bgClass="page-bg-home">
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl tracking-tighter text-foreground max-w-4xl leading-[1.05]"
        >
          Turn Your Bookshelf Into Personalized Recommendations
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-muted-foreground mt-6 max-w-xl font-body"
        >
          Upload a photo of your books. Choose a genre. We'll recommend what you'll love next.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 mt-10"
        >
          <button
            onClick={() => navigate('/snapshelf')}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity font-body flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Snap Your Shelf
          </button>
          <button
            onClick={() => navigate('/recommend')}
            className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold text-sm hover:bg-secondary/80 transition-colors font-body flex items-center gap-2"
          >
            <Star className="w-4 h-4" /> Get Recommendations
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-3xl"
        >
          {[
            { icon: Camera, title: 'Detect', desc: 'Upload a bookshelf photo and our AI detects every book' },
            { icon: BookOpen, title: 'Discover', desc: 'Get detailed info from Google Books for each detected title' },
            { icon: Star, title: 'Recommend', desc: 'Personalized recommendations based on your reading taste' },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 text-center">
              <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg tracking-tight text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </PageShell>
  );
};

export default HomePage;
