import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, LayoutTemplate, Layers, Eye, Compass, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { AppIcon } from '../components/icons/AppIcon';

interface Template {
  id: string;
  template_name: string;
  views: number;
  created_at: string;
  creator_id: string | null;
  is_published: boolean;
  state_data?: {
    nodes?: Array<{ type?: string }>;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        let query = supabase
          .from('shared_templates')
          .select('id, template_name, views, created_at, state_data, creator_id, is_published')
          .order('views', { ascending: false })
          .limit(12);

        if (user?.id) {
          query = query.or(`is_published.eq.true,creator_id.eq.${user.id}`);
        } else {
          query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTemplates(data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [user?.id]);

  const handleCreateNew = () => {
    navigate(`/flow/${uuidv4()}`);
  };

  const handleOpenTemplate = (id: string) => {
    navigate(`/flow/${id}`);
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-[#0a0d14] text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar Minimal */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#135bec] flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
            <AppIcon size={18} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Context Stacker</span>
        </div>
        
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shadow overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#135bec]/50"
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
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 flex flex-col w-full h-full relative">
      
      {/* Start from Scratch Hero Card */}
      <div className="relative mb-16">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-[#101622] border border-white/[0.05] rounded-[1.5rem] p-10 flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wide border border-blue-500/20">
              <LayoutTemplate size={14} />
              Workspace
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Start from Scratch</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Build a custom AI context structure from the ground up. Add nodes, define relationships, and generate tailored outputs.
            </p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="group mt-8 md:mt-0 flex flex-col items-center justify-center w-28 h-28 bg-[#135bec] hover:bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus size={36} className="group-hover:rotate-90 transition-transform duration-300 mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Create</span>
          </button>
        </div>
      </div>

      {/* Featured Blueprints */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <LayoutTemplate className="text-blue-400" size={28} />
          Featured Blueprints
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16">
        {[
          {
            id: 'feat-recruiter',
            name: 'Technical Recruiter',
            desc: 'Extract interview questions from a Resume & Job Description match.',
            icon: 'person_search',
            color: 'blue'
          },
          {
            id: 'feat-pm',
            name: 'Product Manager',
            desc: 'Convert a rough feature idea into a structured PRD with user stories.',
            icon: 'inventory_2',
            color: 'indigo'
          },
          {
            id: 'feat-legal',
            name: 'Legal Auditor',
            desc: 'Analyze contracts for high-risk clauses and missing protections.',
            icon: 'gavel',
            color: 'emerald'
          }
        ].map((feat) => (
          <div 
            key={feat.id}
            className="group relative bg-[#101622] border border-white/[0.05] rounded-[1.25rem] p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${feat.color}-500/10 blur-2xl -mr-8 -mt-8 rounded-full`}></div>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${feat.color}-500/10 border border-${feat.color}-500/20 flex items-center justify-center text-${feat.color}-400`}>
                <span className="material-symbols-outlined">{feat.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                  {feat.name}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed mt-1">
                  {feat.desc}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors flex items-center gap-1 uppercase tracking-widest">
                Deploy Blueprint <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Community Templates Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Compass className="text-indigo-400" size={28} />
          Community Templates
        </h3>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-white/[0.02] border border-white/[0.05] rounded-[1.25rem]"></div>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => {
            const blockCount = template.state_data?.nodes?.filter((n) => n.type === 'contextNode').length || 0;
            
            return (
              <div 
                key={template.id}
                onClick={() => handleOpenTemplate(template.id)}
                className="group bg-[#101622] border border-white/[0.05] rounded-[1.25rem] overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col h-[280px]"
              >
                {/* Abstract Preview Header */}
                <div className="h-28 bg-white/[0.02] relative p-4 overflow-hidden border-b border-white/[0.05] group-hover:bg-white/[0.04] transition-colors flex items-center justify-center">
                  <div className="relative w-full h-full opacity-40 group-hover:opacity-80 transition-opacity flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40"></div>
                    <div className="w-6 h-px bg-slate-700"></div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                      <Layers size={16} className="text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
                    {template.template_name}
                  </h4>
                  <p className="text-slate-500 text-sm line-clamp-2 flex-1">
                    {template.is_published
                      ? 'A community-shared context layout ready to be cloned.'
                      : 'Your private template. Only you can see it on the dashboard.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/[0.05]">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Layers size={14} />
                      {blockCount} Blocks
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          template.is_published
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {template.is_published ? 'Public' : 'Private'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Eye size={14} />
                        {template.views || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center border border-white/[0.05] border-dashed rounded-[1.5rem] bg-white/[0.01]">
          <LayoutTemplate size={48} className="text-slate-600 mb-4" />
          <h4 className="text-lg font-medium text-slate-300 mb-1">No Templates Found</h4>
          <p className="text-sm text-slate-500">Be the first to share a template with the community!</p>
        </div>
      )}
    </main>
    </div>
  );
};

export default Dashboard;
