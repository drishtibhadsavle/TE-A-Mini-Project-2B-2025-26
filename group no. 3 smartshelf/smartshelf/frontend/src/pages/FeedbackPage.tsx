import { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import { submitFeedback } from '@/lib/api';
import { CheckCircle } from 'lucide-react';

const questions = [
  'How easy was it to use SnapShelf to detect books?',
  'How accurate were the book detection results?',
  'How useful were the book recommendations?',
  'How would you rate the overall design and experience?',
  'Would you recommend SmartShelf to a friend?',
];

const options = ['Excellent', 'Good', 'Average', 'Poor'];

const FeedbackPage = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback({ ...answers, suggestions });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-12 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl tracking-tight text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground font-body">Your feedback has been submitted successfully.</p>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl tracking-tighter text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-2 font-body">Help us improve SmartShelf</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="glass-panel p-5">
              <p className="text-sm text-foreground font-body mb-3">{q}</p>
              <div className="flex gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((p) => ({ ...p, [`q${i + 1}`]: opt }))}
                    className={`px-4 py-2 rounded-lg text-xs font-body transition-colors ${
                      answers[`q${i + 1}`] === opt
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="glass-panel p-5">
            <p className="text-sm text-foreground font-body mb-3">Any suggestions for improvement?</p>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={4}
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body resize-none"
              placeholder="Share your thoughts..."
            />
          </div>

          <button type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity font-body">
            Submit Feedback
          </button>
        </form>
      </motion.div>
    </PageShell>
  );
};

export default FeedbackPage;
