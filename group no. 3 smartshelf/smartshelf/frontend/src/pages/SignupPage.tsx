import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '@/lib/auth';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen page-bg-cover flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel-strong p-8 w-full max-w-md"
      >
        <h1 className="text-4xl tracking-tighter text-foreground mb-2">Create Account</h1>
        <p className="text-muted-foreground text-sm mb-8 font-body">Join SmartShelf today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest font-body">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full mt-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest font-body">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full mt-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest font-body">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              className="w-full mt-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-body" />
          </div>

          {error && <p className="text-destructive text-sm font-body">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity font-body disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6 font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
