import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 800))

    const u = username.toLowerCase().trim()
    if (u === 'bugarnusantarajaya@gmail.com' || u === 'owner') {
      localStorage.setItem('efm_role', 'owner')
      localStorage.setItem('efm_nama', 'Bagoes')
      navigate('/dashboard')
    } else if (u === 'essentialfitnessmanagement@gmail.com' || u === 'admin') {
      localStorage.setItem('efm_role', 'admin')
      localStorage.setItem('efm_nama', 'Admin EFM')
      navigate('/dashboard')
    } else {
      setError('Username atau password salah. Coba lagi.')
    }

    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#1E1C43' }}
    >
      {/* Background decorative gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(224,89,69,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(45,43,90,0.6) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 400, height: 400,
          border: '1px solid rgba(255,255,255,0.04)',
          top: -100, right: -100,
        }}
      />

      {/* Card */}
      <div
        className="bg-white rounded-2xl w-full relative z-10"
        style={{ maxWidth: 420, padding: '48px 40px', boxShadow: '0 8px 32px rgba(30,28,67,0.18)' }}
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="EFM Logo"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            style={{ background: '#1E1C43', padding: 4 }}
          />
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight">EFM Portal Login</h1>
          <p className="text-sm text-text-muted mt-1">Secure access for authorized personnel only.</p>
        </div>

        <div className="h-px bg-border mb-7" />

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-sm text-center"
            style={{ background: '#FFF0EE', border: '1px solid #FFCAC4', color: '#C0392B' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
              Username
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text-primary outline-none transition-all"
                style={{
                  border: '1.5px solid #E2E6EA',
                  background: '#F8F9FA',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E1C43'
                  e.target.style.background = '#fff'
                  e.target.style.boxShadow = '0 0 0 3px rgba(30,28,67,0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E6EA'
                  e.target.style.background = '#F8F9FA'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-text-muted pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-text-primary outline-none transition-all"
                style={{
                  border: '1.5px solid #E2E6EA',
                  background: '#F8F9FA',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E1C43'
                  e.target.style.background = '#fff'
                  e.target.style.boxShadow = '0 0 0 3px rgba(30,28,67,0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E6EA'
                  e.target.style.background = '#F8F9FA'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2.5 mb-7">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-primary"
            />
            <label htmlFor="remember" className="text-sm text-text-muted cursor-pointer">
              Keep me logged in
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: '#E05945',
              boxShadow: '0 4px 16px rgba(224,89,69,0.3)',
              fontFamily: 'Poppins, sans-serif',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#C94A38' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#E05945' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Memproses...
              </span>
            ) : 'Login'}
          </button>
        </form>

        {/* Support link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Need assistance?{' '}
          <a href="mailto:essentialfitnessmanagement@gmail.com" className="font-semibold text-text-primary hover:underline">
            Contact Support
          </a>
        </p>

        {/* Footer */}
        <div className="text-center mt-8 pt-5 border-t border-border text-[11px] text-[#BFC5CC] tracking-wide">
          © 2026 EFM MANAGEMENT SYSTEMS
        </div>
      </div>
    </div>
  )
}
