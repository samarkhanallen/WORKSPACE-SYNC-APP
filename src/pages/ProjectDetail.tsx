import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Project, Task, TaskStatus, TaskPriority } from '../types';
import {
  ArrowLeft,
  Plus,
  Users,
  Settings,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (!id || !profile) return;

    const projectRef = doc(db, 'projects', id);
    const unsubscribeProject = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        setProject({ id: snapshot.id, ...snapshot.data() } as Project);
      } else {
        navigate('/');
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `projects/${id}`));

    const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', id));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    return () => {
      unsubscribeProject();
      unsubscribeTasks();
    };
  }, [id, profile, navigate]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project || !profile) return;

    try {
      const taskData = {
        projectId: project.id,
        title: newTaskTitle,
        description: '',
        status: 'todo' as TaskStatus,
        priority: 'medium' as TaskPriority,
        assigneeId: profile.uid,
        memberIds: project.members,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'tasks'), taskData);
      setNewTaskTitle('');
      setShowTaskModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const columns: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: 'To Do' },
    { status: 'in-progress', label: 'In Progress' },
    { status: 'done', label: 'Completed' },
  ];

  return (
    <div className="space-y-12">
      {/* Header - Technical Command */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-l-4 border-[#FF5C00] pl-8">
        <div className="flex items-start gap-6">
          <button
            onClick={() => navigate('/')}
            className="mt-1 p-3 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{project?.name}</h1>
              <div className="p-1 border border-black/10">
                <Settings size={14} className="text-gray-300" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-6">
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 border border-gray-200">
                DESC_{project?.description?.slice(0, 40)}...
              </p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full"></div>
                <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">SYNC_ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {project?.members.slice(0, 4).map((m, i) => (
              <div key={m} className={cn(
                "h-10 w-10 border-2 border-black flex items-center justify-center text-xs font-black font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]",
                i % 2 === 0 ? "bg-white text-black" : "bg-black text-white"
              )}>
                {m[0].toUpperCase()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="brutal-btn"
          >
            <Plus size={18} />
            NEW_TASK
          </button>
        </div>
      </div>

      {/* Kanban Board - Grid Celebration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1px bg-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
        {columns.map((column) => (
          <div key={column.status} className="flex flex-col min-h-[600px] bg-[#F0F0F0]">
            <div className="flex items-center justify-between p-4 bg-white border-b-2 border-black">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-black tracking-[0.2em] uppercase italic">
                  {column.label}
                </span>
                <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5">
                  {tasks.filter(t => t.status === column.status).length.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="w-2 h-2 border border-black"></div>
            </div>

            <div className="flex-1 space-y-4 p-6">
              {tasks.filter(t => t.status === column.status).map((task) => (
                <motion.div
                  layoutId={task.id}
                  key={task.id}
                  className="group brutal-card p-6 border-black hover:shadow-none"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn(
                      "font-mono text-[8px] font-black px-2 py-1 border border-black uppercase tracking-widest",
                      task.priority === 'high' ? 'bg-red-500 text-white' :
                      task.priority === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                    )}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 leading-tight uppercase mb-6 tracking-tight">{task.title}</h4>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[9px] text-gray-400 font-bold">
                      <Clock size={10} />
                      <span>{formatDate(task.dueDate).toUpperCase()}</span>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className="font-mono text-[9px] font-black uppercase tracking-tighter bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-[#FF5C00] transition-colors"
                    >
                      <option value="todo">QUEUE</option>
                      <option value="in-progress">PROCESS</option>
                      <option value="done">COMMIT</option>
                    </select>
                  </div>
                </motion.div>
              ))}

              {tasks.filter(t => t.status === column.status).length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300">
                  <span className="font-mono text-[9px] font-bold text-gray-300 uppercase tracking-widest">STATION_EMPTY</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaskModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create New Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Task Title</label>
                  <input
                    autoFocus
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g. Design user interface"
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 focus:border-black focus:bg-white focus:ring-0 transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
