import React, { useState } from 'react';
import { X, Share2, Check, Loader2, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Props {
  onClose: () => void;
}

const CreateTemplateModal: React.FC<Props> = ({ onClose }) => {
  const { saveAsTemplate, activeProject, user } = useStore();
  const [templateName, setTemplateName] = useState<string>(activeProject?.name || 'My Custom Template');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) return;
    setIsSaving(true);
    const newId = await saveAsTemplate(templateName, isPublished);
    setIsSaving(false);

    if (newId) {
      const url = `${window.location.origin}/flow/${newId}`;
      setSavedUrl(url);
    }
  };

  const handleCopy = () => {
    if (savedUrl) {
      navigator.clipboard.writeText(savedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a202c] border border-[#2d3748] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3748] bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 size={18} className="text-emerald-400" />
            Share Template
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {!savedUrl ? (
            <>
              <p className="text-sm text-slate-300">
                Save this flow as a public community template or keep it private to your own account.
              </p>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  disabled={isSaving || !!savedUrl}
                  placeholder="e.g. Next.js Boilerplate Generator"
                  className="w-full bg-[#0f172a] border border-[#2d3748] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublished(true)}
                    className={`rounded-lg border px-4 py-3 text-left transition-all ${
                      isPublished
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                        : 'border-[#2d3748] bg-[#0f172a] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Share2 size={16} className="text-emerald-400" />
                      Public
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Visible to everyone on the dashboard.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (user) setIsPublished(false);
                    }}
                    className={`rounded-lg border px-4 py-3 text-left transition-all ${
                      !isPublished
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                        : 'border-[#2d3748] bg-[#0f172a] text-slate-400 hover:border-slate-500'
                    }`}
                    disabled={!user}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Lock size={16} className="text-indigo-400" />
                      Private
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {user ? 'Only visible to you after sign-in.' : 'Sign in to save private templates.'}
                    </p>
                  </button>
                </div>
                {!user && (
                  <p className="text-xs text-amber-400">
                    Private templates require sign-in. Anonymous users can only publish public templates.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!templateName.trim() || isSaving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : isPublished ? <Share2 size={16} /> : <Lock size={16} />}
                  {isPublished ? 'Publish Template' : 'Save Private Template'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                <Check size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isPublished ? 'Template Published!' : 'Private Template Saved!'}
              </h3>
              <p className="text-sm text-slate-400 mb-6 px-4">
                {isPublished
                  ? 'Your flow is now live. Share this URL with your team or the community.'
                  : 'Your private template is saved. It will only appear in your own dashboard.'}
              </p>

              <div className="w-full flex items-center bg-[#0f172a] border border-[#2d3748] rounded-lg p-1">
                <input
                  type="text"
                  value={savedUrl}
                  readOnly
                  className="flex-1 bg-transparent border-none text-slate-300 text-sm px-3 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors flex-shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateTemplateModal;
