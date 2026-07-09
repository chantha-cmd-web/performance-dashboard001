import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sun, Moon, Activity, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
    if (!ok) {
      setUserId('');
      setPassword('');
    }
  };

  // Floating blob configurations
  const blobs = [
    { color: '#C4B5FD', size: 600, x: '10%', y: '15%', duration: 28, delay: 0 },
    { color: '#8B5CF6', size: 500, x: '75%', y: '10%', duration: 35, delay: 2 },
    { color: '#60A5FA', size: 450, x: '60%', y: '60%', duration: 32, delay: 1 },
    { color: '#BFDBFE', size: 350, x: '20%', y: '70%', duration: 25, delay: 3 },
    { color: '#FDBA74', size: 400, x: '85%', y: '75%', duration: 30, delay: 0.5 },
    { color: '#F9A8D4', size: 300, x: '40%', y: '25%', duration: 22, delay: 1.5 },
    { color: '#FFFFFF', size: 200, x: '50%', y: '45%', duration: 38, delay: 2.5 },
  ];

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden font-sans ${isDarkMode ? 'dark' : ''}`}
      style={{
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Aurora mesh background - dark base with animated blobs */}
      <div className="absolute inset-0" style={{ backgroundColor: isDarkMode ? '#0b0b1a' : '#f8fafc' }}>
        {/* Floating gradient blobs */}
        {blobs.map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color}${isDarkMode ? '60' : '40'} 0%, ${blob.color}20 40%, transparent 70%)`,
              filter: 'blur(80px)',
              top: blob.y,
              left: blob.x,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
            animate={{
              x: [0, 60, -40, 80, -30, 0],
              y: [0, -50, 70, -30, 40, 0],
              scale: [1, 1.15, 0.9, 1.1, 0.95, 1],
              rotate: [0, 8, -5, 12, -8, 0],
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

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 h-11 w-11 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
        }}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="p-8 md:p-10 border shadow-2xl transition-colors duration-300"
          style={{
            borderRadius: '28px',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: isDarkMode
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.25)',
              }}
            >
              <Activity size={28} className="text-white" />
            </div>
            <h1
              className="text-2xl font-black tracking-tight text-center"
              style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
            >
              Performance Assessment Record
            </h1>
            <p
              className="text-sm font-medium mt-1.5"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
            >
              Western International School
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex flex-col gap-5"
          >
            <div>
              <label
                className="block text-xs font-bold tracking-wider uppercase mb-2"
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
              >
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => { setUserId(e.target.value); if (error) clearError(); }}
                placeholder="Enter your User ID"
                autoFocus
                autoComplete="username"
                className="w-full h-12 px-4 rounded-2xl outline-none transition-all duration-200 text-sm font-medium placeholder:font-normal"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDarkMode ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.6)';
                  e.target.style.boxShadow = isDarkMode
                    ? '0 0 0 3px rgba(6, 182, 212, 0.1)'
                    : '0 0 0 3px rgba(6, 182, 212, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold tracking-wider uppercase mb-2"
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 rounded-2xl outline-none transition-all duration-200 text-sm font-medium placeholder:font-normal"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    color: isDarkMode ? '#f1f5f9' : '#0f172a',
                    paddingRight: '48px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.6)';
                    e.target.style.boxShadow = isDarkMode
                      ? '0 0 0 3px rgba(6, 182, 212, 0.1)'
                      : '0 0 0 3px rgba(6, 182, 212, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-3 rounded-2xl text-xs font-semibold"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      color: '#ef4444',
                    }}
                  >
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative h-13 w-full rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:cursor-not-allowed overflow-hidden border-none"
              style={{
                background: isSubmitting || isLoading
                  ? 'linear-gradient(135deg, #0891b2, #7c3aed)'
                  : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                opacity: isSubmitting || isLoading ? 0.7 : 1,
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
              }}
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={18} />
                  </motion.span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 pt-6 border-t text-center"
            style={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <p
              className="text-[11px] font-medium"
              style={{ color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              Default credentials: <span className="font-bold" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>superadmin</span> / <span className="font-bold" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>admin</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="fixed bottom-6 left-0 right-0 text-center z-10"
      >
        <p
          className="text-[11px] font-medium tracking-wide"
          style={{ color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
        >
          &copy; {new Date().getFullYear()} Western International School. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
