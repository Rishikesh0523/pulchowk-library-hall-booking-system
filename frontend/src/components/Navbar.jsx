import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 font-semibold text-ink-900 tracking-tight">
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink-900 text-white text-sm">
      L
    </span>
    Library Booking
  </Link>
);

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm transition-colors ${
    isActive ? 'text-ink-900 bg-ink-100' : 'text-ink-600 hover:text-ink-900'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="border-b border-ink-200 bg-white sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
              <NavLink to="/calendar" className={linkClass}>Calendar</NavLink>
              <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
              {user.role === 'admin' && (
                <>
                  <span className="mx-2 h-5 w-px bg-ink-200" />
                  <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                  <NavLink to="/admin/rooms" className={linkClass}>Rooms</NavLink>
                  <NavLink to="/admin/bookings" className={linkClass}>Bookings</NavLink>
                </>
              )}
              <div className="ml-3 flex items-center gap-3 pl-3 border-l border-ink-200">
                <span className="text-sm text-ink-500 hidden lg:inline">{user.name}</span>
                <button onClick={onLogout} className="btn-ghost" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Sign in</NavLink>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2 rounded-md text-ink-600 hover:bg-ink-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-200 px-6 py-3 flex flex-col gap-1">
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/rooms" className={linkClass} onClick={() => setOpen(false)}>Rooms</NavLink>
              <NavLink to="/calendar" className={linkClass} onClick={() => setOpen(false)}>Calendar</NavLink>
              <NavLink to="/my-bookings" className={linkClass} onClick={() => setOpen(false)}>My Bookings</NavLink>
              {user.role === 'admin' && (
                <>
                  <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>
                  <NavLink to="/admin/rooms" className={linkClass} onClick={() => setOpen(false)}>Manage Rooms</NavLink>
                  <NavLink to="/admin/bookings" className={linkClass} onClick={() => setOpen(false)}>Manage Bookings</NavLink>
                </>
              )}
              <button onClick={onLogout} className="btn-secondary mt-2">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Sign in</NavLink>
              <Link to="/register" className="btn-primary mt-1" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
