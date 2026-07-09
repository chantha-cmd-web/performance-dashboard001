import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sun, Moon, Activity, Loader, User, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';

function getBlobConfig(isDark: boolean) {
  if (isDark) {
    return [
      { color: '#8B5CF6', size: 600, x: '10%', y: '15%', duration: 28, delay: 0 },
      { color: '#6366F1', size: 500, x: '75%', y: '10%', duration: 35, delay: 2 },
      { color: '#3B82F6', size: 450, x: '60%', y: '60%', duration: 32, delay: 1 },
      { color: '#7C3AED', size: 350, x: '20%', y: '70%', duration: 25, delay: 3 },
      { color: '#6D28D9', size: 400, x: '85%', y: '75%', duration: 30, delay: 0.5 },
      { color: '#4F46E5', size: 300, x: '40%', y: '25%', duration: 22, delay: 1.5 },
    ];
  }
  return [
    { color: '#C4B5FD', size: 550, x: '5%', y: '10%', duration: 30, delay: 0 },
    { color: '#A5B4FC', size: 450, x: '80%', y: '8%', duration: 33, delay: 2 },
    { color: '#BFDBFE', size: 400, x: '55%', y: '65%', duration: 28, delay: 1 },
    { color: '#FDE68A', size: 320, x: '15%', y: '75%', duration: 26, delay: 3 },
    { color: '#FBCFE8', size: 380, x: '88%', y: '78%', duration: 31, delay: 0.5 },
    { color: '#DDD6FE', size: 280, x: '35%', y: '20%', duration: 24, delay: 1.5 },
  ];
}

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('par_login_theme');
    if (stored !== null) setIsDarkMode(stored === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('par_login_theme', next ? 'dark' : 'light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;
    setIsSubmitting(true);
    clearError();
    const ok = await login(userId.trim(), password);
    setIsSubmitting(false);
    if (ok) {
      setUserId('');
      setPassword('');
    }
  };

  const blobs = getBlobConfig(isDarkMode);

  if (!mounted) return null;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-700"
      style={{
        backgroundColor: isDarkMode ? '#0a0a1a' : '#ffffff',
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Aurora background */}
      <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: isDarkMode ? '#0a0a1a' : '#ffffff' }}>
        {blobs.map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle at center, ${blob.color}${isDarkMode ? '50' : '35'} 0%, ${blob.color}15 45%, transparent 70%)`,
              filter: `blur(${isDarkMode ? '90px' : '100px'})`,
              top: blob.y,
              left: blob.x,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
            animate={{
              x: [0, 70, -50, 90, -40, 0],
              y: [0, -60, 80, -40, 50, 0],
              scale: [1, 1.12, 0.92, 1.08, 0.96, 1],
              rotate: [0, 6, -4, 10, -6, 0],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: blob.delay,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
          />
        ))}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 h-10 w-10 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-500 cursor-pointer hover:scale-105"
        style={{
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          color: isDarkMode ? '#e2e8f0' : '#475569',
        }}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div
          className="p-7 sm:p-9 transition-all duration-700"
          style={{
            borderRadius: '28px',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.7)',
            border: `1px solid ${
              isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'
            }`,
            boxShadow: isDarkMode
              ? '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 30px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center mb-7"
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                boxShadow: '0 8px 28px rgba(6, 182, 212, 0.2)',
              }}
            >
              <Activity size={24} className="text-white" />
            </div>
            <h1
              className="text-xl font-bold tracking-tight text-center"
              style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
            >
              Performance Assessment Record
            </h1>
            <p
              className="text-[13px] font-medium mt-1"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            >
              Western International School
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col gap-4.5"
          >
            {/* User ID */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
              >
                User ID
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                />
                <input
                  ref={userIdRef}
                  type="text"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); if (error) clearError(); }}
                  placeholder="Enter your User ID"
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl outline-none text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.5)';
                    e.target.style.boxShadow = isDarkMode
                      ? '0 0 0 3px rgba(6, 182, 212, 0.06)'
                      : '0 0 0 3px rgba(6, 182, 212, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-11 rounded-2xl outline-none text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.5)';
                    e.target.style.boxShadow = isDarkMode
                      ? '0 0 0 3px rgba(6, 182, 212, 0.06)'
                      : '0 0 0 3px rgba(6, 182, 212, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)'}`,
                      color: '#ef4444',
                    }}
                  >
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-11 w-full rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer disabled:cursor-not-allowed overflow-hidden border-none mt-1"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                opacity: isSubmitting || isLoading ? 0.7 : 1,
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)',
              }}
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={16} />
                  </motion.span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="fixed bottom-5 left-0 right-0 text-center z-10"
      >
        <p
          className="text-[11px] font-medium tracking-wide transition-colors duration-700"
          style={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}
        >
          &copy; {new Date().getFullYear()} Western International School. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
