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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/')}
            className="mt-1 p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-none">{project?.name}</h1>
              <div className="p-1 text-gray-200">
                <Settings size={14} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <p className="text-xs text-gray-400 font-medium italic">
                {project?.description}
              </p>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Sync</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {project?.members.slice(0, 4).map((m, i) => (
              <div key={m} className={cn(
                "h-9 w-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm",
                i % 2 === 0 ? "bg-black text-white" : "bg-gray-100 text-black"
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
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {columns.map((column) => (
          <div key={column.status} className="flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {column.label}
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === column.status).length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 rounded-3xl bg-gray-50/50 p-4 border border-dashed border-gray-100">
              {tasks.filter(t => t.status === column.status).map((task) => (
                <motion.div
                  layoutId={task.id}
                  key={task.id}
                  className="brutal-card p-6 rounded-2xl cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      task.priority === 'high' ? 'bg-red-50 text-red-500' :
                      task.priority === 'medium' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                    )}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 className="font-bold text-gray-900 leading-tight mb-4 uppercase text-sm">{task.title}</h4>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <Clock size={12} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className="text-[10px] font-bold text-gray-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-black transition-colors"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">Ongoing</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </motion.div>
              ))}
              {tasks.filter(t => t.status === column.status).length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">No tasks</span>
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
