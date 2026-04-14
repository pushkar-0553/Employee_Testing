import Sidebar from './Sidebar';
import Header from './Header';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function MainLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const sidebarWidth = isMobile ? 0 : (isTablet ? 200 : 260);
  
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <Sidebar />
      <div style={{ 
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'all 0.3s ease',
        paddingTop: isMobile ? '60px' : '64px'
      }} className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-12" style={{
          paddingTop: isMobile ? '20px' : '32px',
          paddingLeft: isMobile ? '16px' : (isTablet ? '24px' : '40px'),
          paddingRight: isMobile ? '16px' : (isTablet ? '24px' : '40px'),
        }}>
          <div className="w-full" style={{ maxWidth: isMobile ? '100%' : '1200px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
