import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 border border-gray-100 shadow-xl rounded-3xl"
      >
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/20">
              <LogIn size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-none">
                SYNC-EAZY
              </h1>
              <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-widest">
                Simple Task Management
              </p>
            </div>
          </div>

          <div className="py-2 space-y-6">
            <p className="text-sm text-center text-gray-500 leading-relaxed max-w-[280px] mx-auto">
              Welcome back. Please sign in with your Google account to access your tasks.
            </p>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="brutal-btn w-full py-4 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </button>
            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-xs font-bold text-center border border-red-100">
                Error: {error}
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-gray-50 text-center">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">
              Built by Samar Khan
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
