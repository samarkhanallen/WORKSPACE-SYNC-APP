import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import { Briefcase, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate } from '../lib/utils';

export default function Projects() {
  const { profile, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile) return;

    const projectsPath = 'projects';
    const projectsQuery = isAdmin
      ? query(collection(db, projectsPath), orderBy('createdAt', 'desc'))
      : query(collection(db, projectsPath), where('members', 'array-contains', profile.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, projectsPath));

    return () => unsubscribe();
  }, [profile, isAdmin]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all your team initiatives.</p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus size={18} />
          New Project
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 py-3 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={project.id}
            >
              <Link
                to={`/projects/${project.id}`}
                className="group flex flex-col h-full rounded-3xl bg-white p-7 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                    <Briefcase size={22} />
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((m, idx) => (
                      <div key={idx} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold ring-1 ring-gray-50">
                        {m[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{project.description || 'No description available.'}</p>
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>{project.members.length} members</span>
                  <span>Created {formatDate(project.createdAt)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-3xl bg-white border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
