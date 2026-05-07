import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Project, Task } from '../types';
import {
  Briefcase,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const projectsPath = 'projects';
    const projectsQuery = isAdmin
      ? query(collection(db, projectsPath), orderBy('createdAt', 'desc'), limit(5))
      : query(collection(db, projectsPath), where('members', 'array-contains', profile.uid), orderBy('createdAt', 'desc'), limit(5));

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, projectsPath));

    const tasksPath = 'tasks';
    const tasksQuery = isAdmin
      ? query(collection(db, tasksPath), orderBy('updatedAt', 'desc'), limit(5))
      : query(collection(db, tasksPath), where('memberIds', 'array-contains', profile.uid), orderBy('updatedAt', 'desc'), limit(5));

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setRecentTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, tasksPath));

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [profile, isAdmin]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Welcome Header - Technical Layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-black pl-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 uppercase">
            OPERATOR: {profile?.displayName?.split(' ')[0]}
          </h1>
          <div className="mt-2 flex items-center gap-4">
            <span className="font-mono text-[10px] font-bold text-gray-400 tracking-[0.2em]">MISSION_STATUS: ACTIVE</span>
            <div className="h-1 w-20 bg-gray-200 overflow-hidden">
              <div className="h-full bg-black w-2/3"></div>
            </div>
          </div>
        </div>
        <Link
          to="/projects/new"
          className="brutal-btn"
        >
          <Plus size={18} />
          INITIALIZE_PROJECT
        </Link>
      </div>

      {/* Stats Grid - Data Precise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'ACTIVE_PROJECTS', value: projects.length, icon: Briefcase, accent: '#000' },
          { label: 'PENDING_TASKS', value: recentTasks.filter(t => t.status !== 'done').length, icon: Clock, accent: '#FF5C00' },
          { label: 'SUCCESS_RATE', value: recentTasks.length > 0 ? Math.round((recentTasks.filter(t => t.status === 'done').length / recentTasks.length) * 100) + '%' : '0%', icon: CheckCircle2, accent: '#00D1FF' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="brutal-card p-8 flex flex-col justify-between h-40"
          >
            <div className="flex items-start justify-between">
              <span className="technical-label">{stat.label}</span>
              <div style={{ color: stat.accent }}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black font-mono tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Projects - Grid celebration */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b border-black pb-4">
            <h2 className="font-mono text-xs font-black tracking-widest uppercase italic">LATEST_OPERATIONS</h2>
            <Link to="/projects" className="font-mono text-[10px] font-bold text-[#FF5C00] hover:underline underline-offset-4">VIEW_ARCHIVE</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length > 0 ? projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group brutal-card p-6 flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">PROJ_{project.id.slice(0, 4)}</span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight uppercase group-hover:text-[#FF5C00] transition-colors">{project.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold text-gray-400 uppercase">ACCESS: {project.members.length} OPS</span>
                  <span className="font-mono text-[9px] font-bold text-gray-400 uppercase">{formatDate(project.createdAt)}</span>
                </div>
              </Link>
            )) : (
              <div className="md:col-span-2 brutal-card border-dashed p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
                <p className="font-mono text-xs text-gray-400 font-bold uppercase tracking-widest">SYSTEM_IDLE: NO_ACTIVE_DATA_POOLS</p>
              </div>
            )}
          </div>
        </section>

        {/* Task Activity - Monospace scannable */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-black pb-4">
            <h2 className="font-mono text-xs font-black tracking-widest uppercase italic">LIVE_FEED</h2>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="brutal-card overflow-hidden">
            {recentTasks.length > 0 ? (
              <div className="divide-y divide-black/5">
                {recentTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className={cn(
                      "h-8 w-8 flex items-center justify-center border",
                      task.status === 'done' ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-200'
                    )}>
                      {task.status === 'done' ? <CheckCircle2 size={14} /> : <div className="w-1 h-3 bg-current"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono text-[11px] font-bold truncate group-hover:text-[#FF5C00] uppercase transition-colors">{task.title}</h4>
                      <p className="font-mono text-[9px] text-gray-400 truncate mt-1">UPDATED_{formatDate(task.updatedAt)}</p>
                    </div>
                    <span className={cn(
                      "font-mono text-[8px] font-black px-1.5 py-0.5 border",
                      task.priority === 'high' ? 'border-red-500 text-red-500' :
                      task.priority === 'medium' ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'
                    )}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-widest">NO_RECENT_TELEMETRY</p>
              </div>
            )}
          </div>
          <div className="mt-8 brutal-card-heavy p-6 bg-black text-white">
            <h4 className="font-mono text-[10px] font-bold tracking-[0.2em] mb-4">SYSTEM_HEALTH</h4>
            <div className="space-y-3">
              {[
                { label: 'CORES', val: '04/04' },
                { label: 'LATENCY', val: '12ms' },
                { label: 'DB_SYNC', val: 'OK' },
              ].map(item => (
                <div key={item.label} className="flex justify-between border-b border-white/10 pb-1">
                  <span className="font-mono text-[9px] font-bold text-gray-500">{item.label}</span>
                  <span className="font-mono text-[9px] font-bold">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/10 text-center">
            <p className="font-mono text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
              ARCHITECT_SIGNAL: INTEGRITY_VERIFIED // BUILT BY SAMAR KHAN
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
