import React, { useEffect, useRef, useState } from 'react';
import { navbarStyles, navbarCSS } from '../assets/dummyStyles';
import { Calendar, Clapperboard, Film, Home, LogOut, Mail, Menu, Ticket, User, ShieldCheck, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const readAuth = () => {
      const json = localStorage.getItem('cine_auth');
      if (json) {
        try {
          const parsed = JSON.parse(json);
          if (parsed && parsed.isLoggedIn) {
            setUser(parsed);
            return;
          }
        } catch (e) {}
      }
      setUser(null);
    };

    readAuth();
    const onStorage = (e) => {
      if (['cine_auth', 'isLoggedIn'].includes(e.key)) readAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cine_auth');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@cineduniya.com';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'movies', label: 'Movies', icon: Film, path: '/movies' },
    { id: 'releases', label: 'Releases', icon: Calendar, path: '/releases' },
    { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
    { id: 'bookings', label: 'Bookings', icon: Ticket, path: '/bookings' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <nav className={`${navbarStyles.nav.base} ${isScrolled ? navbarStyles.nav.scrolled : navbarStyles.nav.notScrolled}`}>
      <div className={navbarStyles.container}>
        <div className={navbarStyles.logoContainer}>
          <div className={navbarStyles.logoIconContainer}>
            <Clapperboard className={navbarStyles.logoIcon} />
          </div>
          <div className={navbarStyles.logoText}>CineDuniya</div>
        </div>

        <div className={navbarStyles.desktopNav}>
          <div className={navbarStyles.desktopNavItems}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={navbarStyles.desktopNavItem}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `${navbarStyles.desktopNavLink.base} ${
                        isActive ? navbarStyles.desktopNavLink.active : navbarStyles.desktopNavLink.inactive
                      }`
                    }
                  >
                    <Icon className={navbarStyles.desktopNavIcon} />
                    <span>{item.label}</span>
                    <div className="pill-underline"></div>
                  </NavLink>
                  <span className="pill-border"></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={navbarStyles.rightSection}>
          <div className={navbarStyles.authSection}>
            <div className={navbarStyles.desktopAuth}>
              {user ? (
                <button title={user.email || 'Logout'} onClick={handleLogout} className={navbarStyles.logoutButton}>
                  <LogOut className={navbarStyles.authIcon} />
                  <span>Logout</span>
                </button>
              ) : (
                <a href="/login" className={navbarStyles.loginButton}>
                  <User className={navbarStyles.authIcon} />
                  <span>Login</span>
                </a>
              )}
            </div>

            <div className={navbarStyles.mobileMenuToggle}>
              <button onClick={() => setIsMenuOpen((s) => !s)} className={navbarStyles.mobileMenuButton}>
                {isMenuOpen ? <X className={navbarStyles.mobileMenuIcon} /> : <Menu className={navbarStyles.mobileMenuIcon} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div ref={menuRef} className={navbarStyles.mobileMenuPanel}>
            <div className={navbarStyles.mobileMenuItems}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `${navbarStyles.mobileNavLink.base} ${
                        isActive ? navbarStyles.mobileNavLink.active : navbarStyles.mobileNavLink.inactive
                      }`
                    }
                  >
                    <Icon className={navbarStyles.mobileNavIcon} />
                    <span className={navbarStyles.mobileNavText}>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className={navbarStyles.mobileAuthSection}>
                {user ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className={navbarStyles.mobileLogoutButton}
                  >
                    <LogOut className={navbarStyles.mobileAuthIcon} />
                    Logout
                  </button>
                ) : (
                  <a href="/login" className={navbarStyles.mobileLoginButton} onClick={() => setIsMenuOpen(false)}>
                    <User className={navbarStyles.mobileAuthIcon} />
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{navbarCSS}</style>
    </nav>
  );
};

export default Navbar;
