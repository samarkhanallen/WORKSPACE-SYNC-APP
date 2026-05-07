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
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome, {profile?.displayName?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-gray-400 font-medium tracking-tight">
            Manage your daily tasks and projects effortlessly.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="brutal-btn"
        >
          <Plus size={18} />
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'text-blue-500' },
          { label: 'Pending Tasks', value: recentTasks.filter(t => t.status !== 'done').length, icon: Clock, color: 'text-orange-500' },
          { label: 'Completion Rate', value: recentTasks.length > 0 ? Math.round((recentTasks.filter(t => t.status === 'done').length / recentTasks.length) * 100) + '%' : '0%', icon: CheckCircle2, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="brutal-card p-8 flex items-center justify-between"
          >
            <div>
              <p className="technical-label">{stat.label}</p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className={stat.color}>
              <stat.icon size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Projects */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Projects</h2>
            <Link to="/projects" className="text-xs font-bold text-blue-500 hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length > 0 ? projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group brutal-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PJ-{project.id.slice(0, 4)}</span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-blue-500 transition-colors uppercase italic">{project.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{project.members.length} Members</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(project.createdAt)}</span>
                </div>
              </Link>
            )) : (
              <div className="md:col-span-2 brutal-card border-dashed p-16 flex flex-col items-center justify-center text-center bg-gray-50/20">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No active projects found</p>
              </div>
            )}
          </div>
        </section>

        {/* Task Activity */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Activity</h2>
          </div>
          <div className="brutal-card rounded-2xl overflow-hidden divide-y divide-gray-50">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    task.status === 'done' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-300'
                  )}>
                    {task.status === 'done' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate group-hover:text-blue-500 uppercase transition-colors">{task.title}</h4>
                    <p className="text-[10px] text-gray-400 truncate mt-1">Updated {formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No recent task activity</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Built by Samar Khan
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
