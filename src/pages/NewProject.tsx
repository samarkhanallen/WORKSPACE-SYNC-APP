import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !profile) return;

    setLoading(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        ownerId: profile.uid,
        members: [profile.uid],
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      navigate(`/projects/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-xl text-gray-400 hover:bg-white hover:text-black transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">New Project</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl bg-white p-10 border border-gray-100 shadow-sm"
      >
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Project Identity</label>
          <div className="space-y-4">
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name (e.g. Q3 Roadmap)"
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 focus:border-black focus:bg-white focus:ring-0 transition-all text-xl font-bold placeholder:font-normal"
            />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about? (Optional)"
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 focus:border-black focus:bg-white focus:ring-0 transition-all resize-none"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-indigo-50/50 p-6 flex gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">Workspace Membership</p>
            <p className="text-xs text-indigo-600 mt-1">Starting with you as the owner. You can invite team members once active.</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>Start Project</>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
