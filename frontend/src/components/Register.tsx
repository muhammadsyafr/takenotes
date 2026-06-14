import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, StickyNote } from 'lucide-react';

const SLIDES = [
  'Capture Thoughts,\nCreate Brilliance',
  'Write Ideas,\nShape Your World',
  'Organize Notes,\nInspire Action',
];

const inputBase =
  'w-full bg-patina-surface border border-patina-border/[.10] rounded-patina-md px-4 py-3.5 text-patina-on-surface placeholder-patina-muted text-sm outline-none focus:border-patina-primary focus:ring-2 focus:ring-patina-primary/10 transition-colors';

export function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [slide, setSlide] = useState(0);
  const { register } = useStore();

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-patina-neutral">
      <div
        className="w-full max-w-[860px] rounded-patina-lg overflow-hidden flex shadow-xl"
        style={{ minHeight: '580px' }}
      >
        {/* Left panel */}
        <div
          className="hidden md:flex md:w-[45%] flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(155deg, #0A94F5 0%, #0a6fd4 45%, #0A3350 100%)',
          }}
        >
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }}
          />
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 520 260"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 260 L0 175 L70 105 L140 158 L220 65 L300 128 L385 45 L465 118 L520 88 L520 260 Z"
              fill="rgba(10,51,80,0.45)"
            />
            <path
              d="M0 260 L0 215 L90 148 L175 198 L255 128 L345 183 L425 108 L505 158 L520 145 L520 260 Z"
              fill="rgba(10,51,80,0.30)"
            />
          </svg>

          <div className="relative z-10 flex items-center p-6">
            <StickyNote className="w-5 h-5 text-white mr-2 flex-shrink-0" />
            <span className="text-white font-bold text-base font-manrope">TakeNote</span>
          </div>

          <div className="relative z-10 mt-auto p-8">
            <p className="text-white text-2xl font-semibold text-center leading-snug whitespace-pre-line mb-6 font-manrope">
              {SLIDES[slide]}
            </p>
            <div className="flex items-center justify-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide ? 'bg-white w-6 h-1.5' : 'bg-white/40 w-1.5 h-1.5 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:px-10 bg-patina-surface">
          <h1 className="text-[28px] font-bold text-patina-on-surface mb-1.5 font-manrope">
            Create an account
          </h1>
          <p className="text-sm text-patina-muted mb-7">
            Already have an account?{' '}
            <button
              onClick={() => (window.location.hash = 'login')}
              className="text-patina-primary hover:text-primary-700 font-medium transition-colors"
            >
              Log in
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-patina-error/10 text-patina-error text-sm p-3 rounded-patina-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputBase}
              />
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputBase}
              />
            </div>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={inputBase}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={`${inputBase} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-patina-muted hover:text-patina-on-surface transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-0.5">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    agreed
                      ? 'bg-patina-primary border-patina-primary'
                      : 'bg-transparent border-patina-border/[.20]'
                  }`}
                >
                  {agreed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-patina-muted">
                I agree to the{' '}
                <span className="text-patina-primary">Terms &amp; Conditions</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full font-semibold text-white text-base bg-patina-primary hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ minHeight: '57px' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
