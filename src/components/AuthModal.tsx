import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, X, Compass } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!displayName) {
          setError('Please provide a display name');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
      if (err.code === 'auth/user-not-found') msg = 'No user found with this email.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div 
        className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl shadow-gold/5"
        id="auth-modal-content"
      >
        {/* Absolute design accents */}
        <div className="absolute right-0 top-0 h-24 w-24 bg-gold/5 rounded-full blur-2xl" />
        <div className="absolute left-0 bottom-0 h-24 w-24 bg-amber-900/10 rounded-full blur-2xl" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-text-subtle hover:text-white transition-colors cursor-pointer p-1"
          title="Close Auth"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto bg-gold p-3 rounded-full text-black w-fit shadow-md shadow-gold/10">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white tracking-tight italic">
            {isSignUp ? 'Create Heritage Account' : 'Welcome back, Explorer'}
          </h2>
          <p className="text-xs text-text-subtle font-sans">
            {isSignUp ? 'Join to curate and preserve your deep cultural journeys' : 'Sign in to access your saved slow travel plans'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 rounded-lg flex gap-2 text-xs text-red-300 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gold uppercase font-bold tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
                <input
                  type="text"
                  placeholder="e.g. Marco Polo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 focus:border-gold/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none font-sans"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gold uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
              <input
                type="email"
                placeholder="explorer@heritage.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 focus:border-gold/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gold uppercase font-bold tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 focus:border-gold/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white outline-none font-sans"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gold text-black hover:bg-gold-light disabled:opacity-50 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/5"
          >
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Authenticating...' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono text-text-muted uppercase">or continue with</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Social Provider */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-[#17171B] border border-white/5 hover:border-white/10 text-white rounded font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Account
        </button>

        {/* Footer Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-text-subtle hover:text-gold transition-colors font-mono cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New explorer? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
