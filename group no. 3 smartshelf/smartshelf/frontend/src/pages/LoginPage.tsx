import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/auth';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen page-bg-cover flex flex-col items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="vintage-panel p-10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-serif tracking-wide text-[#F3E5AB] mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>SmartShelf</h1>
          <p className="text-[#C1A87D] text-sm font-serif italic tracking-wide">Sign in to your library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs text-[#C1A87D] uppercase tracking-widest font-serif mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#3E2723]/60 border border-[#5D4037] rounded-md px-4 py-3 text-sm text-[#E8DCC4] placeholder:text-[#8D6E63] focus:outline-none focus:border-[#C1A87D] font-serif transition-colors shadow-inner"
              placeholder="reader@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-[#C1A87D] uppercase tracking-widest font-serif mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#3E2723]/60 border border-[#5D4037] rounded-md px-4 py-3 text-sm text-[#E8DCC4] placeholder:text-[#8D6E63] focus:outline-none focus:border-[#C1A87D] font-serif transition-colors shadow-inner"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm font-serif text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8D6E63]/80 hover:bg-[#5D4037] border border-[#C1A87D]/50 text-[#F3E5AB] py-3 rounded-md font-serif tracking-wide text-lg transition-all disabled:opacity-50 mt-4 shadow-lg"
          >
            {loading ? 'Opening Vault...' : 'Enter Library'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#5D4037]/50 text-center">
          <p className="text-sm text-[#C1A87D] font-serif">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F3E5AB] hover:text-white transition-colors border-b border-[#F3E5AB]/30 hover:border-white pb-0.5">Sign up</Link>
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-12 text-[#F3E5AB] font-serif italic text-2xl tracking-wider text-center px-4"
        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.95), 0px 0px 10px rgba(0,0,0,0.8)' }}
      >
        "Unlock the Wisdom of Every Shelf."
      </motion.div>
    </div>
  );
};

export default LoginPage;
