import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import { BookOpen, Camera, Star, Cpu, Globe } from 'lucide-react';

const features = [
  { icon: Camera, title: 'Book Detection', desc: 'Upload a photo of any bookshelf and our YOLOv8 model detects individual books with high accuracy.' },
  { icon: Cpu, title: 'OCR Text Extraction', desc: 'PaddleOCR extracts text from book spines, which is then matched to titles using TF-IDF cosine similarity.' },
  { icon: Globe, title: 'Google Books Integration', desc: 'Every detected book is enriched with metadata from Google Books — covers, ratings, descriptions, and more.' },
  { icon: Star, title: 'Smart Recommendations', desc: 'Three recommendation engines: genre-based (Random Forest), rating-based, and personalized from your history.' },
  { icon: BookOpen, title: 'Reading History', desc: 'All your detected and explored books are saved, building a personal library over time.' },
];

const AboutPage = () => {
  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-5xl tracking-tighter text-foreground mb-4">About SmartShelf</h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto">
            SmartShelf bridges the physical and digital worlds of reading. Point your camera at a bookshelf, 
            and let AI do the rest — identifying, cataloging, and recommending books tailored to your taste.
          </p>
        </div>

        <div className="space-y-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 flex gap-5 items-start"
            >
              <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg tracking-tight text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-panel p-6 text-center">
          <h3 className="text-xl tracking-tight text-foreground mb-2">Tech Stack</h3>
          <p className="text-sm text-muted-foreground font-body">
            React • Node.js + Express • Python + FastAPI • YOLOv8 • PaddleOCR • SQLite • Google Books API
          </p>
        </div>
      </motion.div>
    </PageShell>
  );
};

export default AboutPage;
