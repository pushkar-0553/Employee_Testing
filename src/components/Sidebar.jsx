import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineUserAdd,
  HiOutlineLockClosed, HiOutlineLogout
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, description: 'Overview & analytics' },
  { path: '/employees', label: 'Employees', icon: HiOutlineUserGroup, description: 'Manage team members' },
  { path: '/add-employee', label: 'Add Employee', icon: HiOutlineUserAdd, description: 'Onboard new talent' },
  { path: '/change-password', label: 'Settings', icon: HiOutlineLockClosed, description: 'Account & security' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU';

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>EM</span>
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px', lineHeight: 1.2, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>EmpManager</div>
            <div style={{ color: '#475569', fontWeight: 500, fontSize: '11px', marginTop: '2px' }}>HR Management System</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '8px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Main Navigation</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link${isActive ? ' active' : ''}`}
              >
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.18s ease',
                }}>
                  <item.icon size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: isActive ? '#f1f5f9' : '#94a3b8', lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: isActive ? '#93c5fd' : '#475569', marginTop: '2px' }}>{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f87171', flexShrink: 0,
          }}>
            <HiOutlineLogout size={17} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#f87171', lineHeight: 1.2 }}>Logout</div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Sign out of account</div>
          </div>
        </button>

      
      </div>
    </aside>
  );
}