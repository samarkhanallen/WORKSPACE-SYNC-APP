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
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg brutal-card-heavy p-12 bg-white"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-black pb-8">
            <div className="flex h-16 w-16 items-center justify-center bg-black text-white outline outline-8 outline-black/5">
              <LogIn size={32} />
            </div>
            <div>
              <h1 className="font-mono text-4xl font-black tracking-tighter uppercase leading-none">
                SYNC-EAZY
              </h1>
              <p className="font-mono text-[10px] font-bold text-[#FF5C00] tracking-[0.2em] mt-2 uppercase">
                HIGH_PERFORMANCE_TASK_KERNEL
              </p>
            </div>
          </div>

          <div className="py-8 space-y-6">
            <p className="font-mono text-xs text-gray-500 uppercase leading-relaxed">
              [SYSTEM_MESSAGE]: PLEASE AUTHENTICATE TO ACCESS SECURE WORKSPACE. 
              G-AUTH_REQUIRED_FOR_ROOT_TENANT_VERIFICATION.
            </p>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="brutal-btn w-full py-5 text-sm"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <div className="flex items-center gap-4">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 invert transition-all" />
                  INIT_SECURE_LOGIN_v2
                </div>
              )}
            </button>
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 text-red-600 font-mono text-[10px] font-bold uppercase">
                CRITICAL_AUTH_FAILURE: {error}
              </div>
            )}
          </div>

          <div className="border-t-2 border-black pt-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-bold text-gray-400">ENCRYPTION: AES-256</span>
              <span className="font-mono text-[9px] font-bold text-gray-400 italic">SECURED_BY_FIREBASE_CORE</span>
            </div>
            <div className="h-6 w-1 bg-[#FF5C00]"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
