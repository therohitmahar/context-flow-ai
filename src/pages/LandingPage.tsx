import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Layers, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRedirectURL } from '../lib/auth';
import { useStore } from '../store/useStore';
import { ReactFlowProvider } from '@xyflow/react';
import { HeroFlow } from '../components/HeroFlow/HeroFlow';
import { FeatureFlow } from '../components/FeatureFlow/FeatureFlow';
import { AppIcon } from '../components/icons/AppIcon';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectURL(),
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateNew = () => {
    // Generate a fresh local ID. This is essentially the flow's "local draft ID" 
    // until they decide to hit "Save Template" which will push it to Supabase.
    navigate(`/flow/${uuidv4()}`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200">
      <header className="h-20 border-b border-transparent bg-transparent flex items-center justify-between px-6 lg:px-12 z-50 shrink-0 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-gradient-to-tr from-blue-600 to-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <AppIcon size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Context Stacker</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#how-it-works">How it Works</a>
          <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#features">Features</a>
          <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#templates">Templates</a>
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button onClick={handleLogin} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</button>
              <button onClick={handleLogin} className="px-5 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 hidden sm:block">
                Get Started
              </button>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shadow overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a202c] border border-[#2d3748] rounded-xl shadow-xl overflow-hidden z-50 py-1">
                  <div className="px-3 py-2 border-b border-[#2d3748] mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email || 'Anonymous Session'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <Layers size={14} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left border-t border-[#2d3748] mt-1 pt-2"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-20 pb-0 overflow-hidden flex flex-col items-center text-center px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-surface-dark/50 backdrop-blur text-sm font-medium text-primary mb-8 animate-fade-in-up">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>Visual Prompt Engineering</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto mb-6 leading-tight">
            Build advanced <span className="text-gradient">AI workflows</span> visually.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stack context blocks, define global variables, and wire them up to a Composer node to generate robust outputs across varying templates.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button 
              onClick={handleCreateNew}
              className="group px-8 py-4 bg-white text-slate-900 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-xl shadow-primary/10 flex items-center gap-2"
            >
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">add_circle</span>
              Create Blank Flow
            </button>
            <button 
              onClick={() => user ? navigate('/dashboard') : handleLogin()}
              className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-xl text-lg font-medium hover:bg-slate-800 transition-colors backdrop-blur-sm"
            >
              Explore Templates
            </button>
          </div>

          <div className="w-full max-w-6xl mx-auto relative z-10 px-4">
            <div className="relative rounded-t-2xl border border-slate-800 bg-surface-dark/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-900/20 aspect-[16/9] md:aspect-[21/9]">
              <ReactFlowProvider>
                <HeroFlow />
              </ReactFlowProvider>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-20"></div>
          </div>
        </section>

        <section className="relative bg-background-dark py-16 lg:py-24 border-t border-slate-800/50">
          <div className="absolute inset-0 live-preview-grid opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-transparent to-background-dark pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:w-1/3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-xs font-semibold text-blue-300 mb-6">
                  <span className="material-symbols-outlined text-sm">hub</span>
                  <span>Node System</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Interactive Context Layer</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Visually wire up your context sources in a dynamic environment. Drag nodes, connect data pipelines, and see how your information flows into the final prompt composer in real-time.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                    <span className="text-slate-300">Drag &amp; drop interface for intuitive building</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                    <span className="text-slate-300">Real-time data flow visualization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                    <span className="text-slate-300">Smart connection validation</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-2/3 w-full">
                <div className="relative w-full h-[450px] bg-surface-dark/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute inset-0 live-preview-grid opacity-20"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <ReactFlowProvider>
                      <FeatureFlow />
                    </ReactFlowProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-dark relative overflow-hidden" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Workflow Intelligence</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">From raw idea to structured output in three simple steps.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent border-t border-dashed border-slate-600 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 shadow-xl shadow-black/50 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl text-blue-400">input</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-400 mb-4 border border-slate-700">STEP 01</div>
                <h3 className="text-xl font-bold text-white mb-2">Input Context</h3>
                <p className="text-slate-400 text-sm">Upload documents, paste text, or connect APIs to gather the raw materials for your prompt.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 shadow-xl shadow-black/50 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl text-purple-400">tune</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-400 mb-4 border border-slate-700">STEP 02</div>
                <h3 className="text-xl font-bold text-white mb-2">Structure Logic</h3>
                <p className="text-slate-400 text-sm">Define the rules. Use logical operators and context blocks to guide the AI's reasoning path.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 shadow-xl shadow-black/50 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl text-green-400">output</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-400 mb-4 border border-slate-700">STEP 03</div>
                <h3 className="text-xl font-bold text-white mb-2">Generate &amp; Iterate</h3>
                <p className="text-slate-400 text-sm">Run the flow to get your output. Tweak parameters and re-run instantly to perfect the result.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-dark relative border-t border-slate-800/50" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-background-dark border border-slate-800 hover:border-primary/50 transition-colors group">
                <div className="size-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl">view_module</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Modular Context Blocks</h3>
                <p className="text-slate-400 leading-relaxed">Drag and drop reusable context modules. Stop rewriting the same prompt instructions for every new workflow.</p>
              </div>
              
              <div className="p-8 rounded-2xl bg-background-dark border border-slate-800 hover:border-primary/50 transition-colors group">
                <div className="size-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl">account_tree</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Visual Node Canvas</h3>
                <p className="text-slate-400 leading-relaxed">Map out complex logic visually. Connect data sources, transformations, and AI models in a clear, node-based interface.</p>
              </div>
              
              <div className="p-8 rounded-2xl bg-background-dark border border-slate-800 hover:border-primary/50 transition-colors group">
                <div className="size-14 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl">alternate_email</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Dynamic @Mentions</h3>
                <p className="text-slate-400 leading-relaxed">Reference variables and previous outputs instantly. Type '@' to inject dynamic content anywhere in your prompt chain.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-dark border-t border-slate-800/50" id="templates">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Start with a Blueprint</h2>
                <p className="text-slate-400">Choose from hundreds of community-crafted workflows.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent flex items-end justify-center pb-12 pointer-events-none"></div>
              
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                <button 
                  onClick={() => user ? navigate('/dashboard') : handleLogin()}
                  className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform border border-slate-200"
                >
                  {user ? 'View Community Hub' : 'Sign up to use templates'}
                </button>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="group bg-surface-dark border border-slate-800 rounded-xl overflow-hidden opacity-60">
                  <div className="h-40 bg-[#151b28] relative p-4 overflow-hidden border-b border-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center opacity-60">
                      <div className="relative w-32 h-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded bg-blue-500/20 border border-blue-500/40 z-10"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 rounded bg-purple-500/20 border border-purple-500/40 z-10"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded bg-green-500/20 border border-green-500/40 z-10"></div>
                        <svg className="absolute inset-0 w-full h-full text-slate-600" stroke="currentColor" strokeWidth="1.5">
                          <line x1="50%" x2="20%" y1="20%" y2="80%"></line>
                          <line x1="50%" x2="80%" y1="20%" y2="80%"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-white mb-2">Example Public Template {i}</h4>
                    <p className="text-slate-500 text-sm mb-4">A powerful workflow layout generated by the community...</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-500">Multiple Context Blocks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-dark border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-8 bg-gradient-to-tr from-blue-600 to-primary rounded-lg flex items-center justify-center text-white">
                  <AppIcon size={18} />
                </div>
                <span className="font-bold text-lg text-white">Context Stacker</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Empowering creators to build sophisticated AI workflows without writing a single line of code.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© 2026 Context Stacker Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
