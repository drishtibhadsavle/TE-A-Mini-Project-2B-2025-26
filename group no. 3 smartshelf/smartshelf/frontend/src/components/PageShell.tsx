import NavBar from './NavBar';

interface PageShellProps {
  children: React.ReactNode;
  bgClass?: string;
}

const PageShell = ({ children, bgClass = 'page-bg-inner' }: PageShellProps) => {
  return (
    <div className={`min-h-screen ${bgClass}`}>
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default PageShell;
