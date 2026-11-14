import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type AppRoute =
  | '/'
  | '/about'
  | '/departments'
  | '/doctors'
  | '/services'
  | '/emergency'
  | '/contact'
  | '/appointments'
  | '/portal'
  | `/doctors/${string}`;

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: AppRoute) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { firebaseUser } = useAuth();

  const handleLinkClick = (path: AppRoute) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  const navItems: Array<{ label: string; path: AppRoute }> = [
    { label: 'Departments', path: '/departments' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Services', path: '/services' },
    { label: 'Emergency', path: '/emergency' },
    { label: firebaseUser ? 'Patient Portal' : 'Sign In', path: '/portal' },
  ];

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('/')}
          className="text-lg font-display font-bold tracking-tight text-[#0F4C81] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm cursor-pointer"
        >
          St. Mary&apos;s Premier Health
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleLinkClick(item.path)}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] ${
                isActive(item.path)
                  ? 'border-[#1D4ED8] text-slate-900 font-semibold'
                  : 'border-transparent hover:text-[#0F4C81] hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('/appointments')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 min-h-[40px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            Book Appointment
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-lg">
          <nav
            aria-label="Mobile navigation"
            className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1"
          >
            {[
              { label: 'Home', path: '/' as AppRoute },
              { label: 'About Us & Hospital Profile', path: '/about' as AppRoute },
              { label: 'Departments', path: '/departments' as AppRoute },
              { label: 'Doctors & Specialists', path: '/doctors' as AppRoute },
              { label: 'Services & Facilities', path: '/services' as AppRoute },
              { label: 'Emergency Information', path: '/emergency' as AppRoute },
              { label: 'Contact Us', path: '/contact' as AppRoute },
              {
                label: firebaseUser ? 'Patient Portal' : 'Login / Registration',
                path: '/portal' as AppRoute,
              },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleLinkClick(item.path)}
                className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-[#0F4C81] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleLinkClick('/appointments')}
                className="w-full py-2.5 px-4 min-h-[44px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
