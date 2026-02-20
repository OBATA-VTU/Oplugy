import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BoltIcon, SignalIcon, WalletIcon, ShieldCheckIcon, HistoryIcon, MenuIcon } from './Icons';

export const TerminalContext = React.createContext<any>(null);

const TerminalLayout: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const addLog = React.useCallback((message: string, type: 'info' | 'success' | 'error' | 'cmd' | 'data' = 'info', rawData?: any) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      data: rawData
    }]);
  }, []);

  const clearLogs = React.useCallback(() => setLogs([]), []);

  const contextValue = React.useMemo(() => ({ addLog, clearLogs }), [addLog, clearLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-close sidebar on mobile nav
  useEffect(() => setSidebarOpen(false), [location]);

  return (
    <TerminalContext.Provider value={contextValue}>
      <div className="min-h-screen bg-zinc-950 text-green-500 font-mono flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-black border-r border-zinc-800 transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-8 space-y-12">
            <div>
               <h1 className="text-white font-black tracking-tighter text-xl flex items-center gap-2">
                 <BoltIcon /> NODE_DEBUG
               </h1>
               <p className="text-zinc-600 text-[9px] uppercase tracking-widest mt-1 font-bold">Oplug Infrastructure v2.1</p>
            </div>

            <nav className="space-y-2">
               <NavItem to="/terminal/overview" icon={<HistoryIcon />} label="System Overview" />
               <NavItem to="/terminal/vtu" icon={<SignalIcon />} label="VTU Infrastructure" />
               <NavItem to="/terminal/payments" icon={<WalletIcon />} label="Payment Gateway" />
               <NavItem to="/terminal/media" icon={<ShieldCheckIcon />} label="Media & Evidence" />
            </nav>

            <div className="pt-10 border-t border-zinc-900">
               <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Socket Stable</span>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Interface */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Header */}
          <header className="p-6 border-b border-zinc-900 bg-black/50 backdrop-blur-md flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-zinc-500"><MenuIcon /></button>
                <div className="hidden lg:block h-4 w-1 bg-green-500/20 rounded-full"></div>
                <h2 className="text-zinc-400 text-xs font-black uppercase tracking-[0.3em]">Diagnostic Path: <span className="text-green-500">{location.pathname.replace('/terminal/', '').toUpperCase()}</span></h2>
             </div>
             <button onClick={clearLogs} className="px-4 py-2 border border-red-900/50 text-red-500 text-[10px] font-black uppercase hover:bg-red-950 transition-all rounded">Reset Buffer</button>
          </header>

          {/* Test Area */}
          <section className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <Outlet />
          </section>

          {/* Persistent Shared Console Output */}
          <section className="h-1/3 lg:h-80 bg-zinc-950 border-t border-zinc-800 flex flex-col shrink-0 shadow-2xl">
             <div className="p-3 px-6 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Diagnostic Stream (v2.1)</span>
                <span className="text-[9px] font-mono text-zinc-700">STD_ERR // STD_OUT</span>
             </div>
             <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto font-mono text-xs space-y-2 selection:bg-green-900 selection:text-white">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-800 italic uppercase tracking-[0.2em] text-[10px]">Awaiting node command execution...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="animate-in fade-in duration-100">
                      <span className="text-zinc-700 mr-3">[{log.timestamp}]</span>
                      <span className={`
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                        ${log.type === 'cmd' ? 'text-blue-400 font-black' : ''}
                        ${log.type === 'data' ? 'text-purple-400' : ''}
                        ${log.type === 'info' ? 'text-zinc-500' : ''}
                      `}>
                        {log.type === 'cmd' ? '> ' : ''}{log.message}
                      </span>
                      {log.data && (
                        <pre className="mt-2 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 overflow-x-auto whitespace-pre-wrap max-w-full">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
             </div>
          </section>
        </main>
      </div>
    </TerminalContext.Provider>
  );
};

const NavItem = ({ to, icon, label }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 p-4 rounded-xl transition-all border border-transparent
      ${isActive ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'}
    `}
  >
    {icon}
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </NavLink>
);

export default TerminalLayout;