import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/lib/auth';

const navLinks = [
  { to: '/snapshelf', label: 'SnapShelf' },
  { to: '/history', label: 'Reading History' },
  { to: '/saved', label: 'Saved Books' },
  { to: '/recommend', label: 'Recommend Book' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/about', label: 'About Us' },
];

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="vintage-shelf sticky top-0 z-50 px-8 py-3 w-full flex items-center gap-6">
      <Link to="/home" className="font-serif text-3xl tracking-wide text-[#F3E5AB] shrink-0" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        SmartShelf
      </Link>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-md mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C1A87D]" />
        <input
          type="text"
          placeholder="Search for a classic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#3E2723]/60 border border-[#5D4037] rounded-md pl-9 pr-3 py-2 text-sm text-[#E8DCC4] placeholder:text-[#C1A87D] focus:outline-none focus:border-[#8D6E63] font-serif transition-colors shadow-inner"
        />
      </form>

      <div className="flex items-center gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-2 rounded text-sm ${
              location.pathname === link.to
                ? 'vintage-nav-active'
                : 'vintage-nav-link'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="text-[#C1A87D] hover:text-[#F3E5AB] transition-colors ml-4 p-2 rounded hover:bg-black/20" title="Logout">
        <LogOut className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default NavBar;
