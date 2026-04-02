import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <Sidebar />
      <div style={{ marginLeft: '260px' }} className="transition-all duration-300 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-12 px-10">
          <div className="max-w-350 mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
