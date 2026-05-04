import { useState } from 'react';
import { useStore } from '../store';
import { StickyNote, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, theme, setTheme, showToast } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password);
      showToast('Account created!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className={`min-h-dvh flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-sm">
        <div className={`text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
            <StickyNote className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold">TakeNote</h1>
        </div>

        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Confirm password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className={`mt-5 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Have an account?{' '}
            <button
              onClick={() => window.location.hash = 'login'}
              className="text-primary-600 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}