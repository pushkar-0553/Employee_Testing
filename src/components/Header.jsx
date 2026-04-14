import { useState } from 'react';
import { HiOutlineBell, HiOutlineUserCircle, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU';
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const sidebarWidth = isMobile ? 0 : (isTablet ? 200 : 260);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: isMobile ? 0 : sidebarWidth,
      right: 0,
      height: isMobile ? '60px' : '64px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 28px',
      zIndex: 40,
      transition: 'all 0.3s ease',
    }}>
      {/* Spacer */}
      <div style={{ flex: 1 }}></div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '5px 10px 5px 5px',
              background: 'transparent', border: '1.5px solid #e2e8f0',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '12px',
            }}>{initials}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', lineHeight: 1.2 }}>{user.name || 'Admin User'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>Administrator</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}