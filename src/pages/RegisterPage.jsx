import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Input, message } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../config/api'
import { normalizePhoneNumber, validateEmail, validatePassword, validatePhoneNumber } from '../utils/validation'

const passwordRules = [
  { label: 'Minimal 8 karakter', test: (value) => value.length >= 8 },
  { label: 'Ada huruf besar', test: (value) => /[A-Z]/.test(value) },
  { label: 'Ada huruf kecil', test: (value) => /[a-z]/.test(value) },
  { label: 'Ada karakter spesial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    about: 'Available',
    password: '',
    confirmPassword: '',
  })

  const passwordChecks = useMemo(() => passwordRules.map((rule) => ({ ...rule, valid: rule.test(form.password) })), [form.password])

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    if (!form.username.trim()) return 'Username wajib diisi'
    if (!validateEmail(form.email)) return 'Format email tidak valid'
    if (!validatePhoneNumber(form.phoneNumber)) return 'Format nomor telepon tidak valid. Contoh: 0823888197372'
    if (!validatePassword(form.password)) return 'Password minimal 8 karakter, ada huruf besar, huruf kecil, dan karakter spesial'
    if (form.password !== form.confirmPassword) return 'Password dan konfirmasi password tidak sama'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      message.error(validationError)
      return
    }

    setLoading(true)

    try {
      await api({
        url: '/user/register',
        method: 'POST',
        data: { ...form, phoneNumber: normalizePhoneNumber(form.phoneNumber) },
      })

      message.success('Register berhasil, silakan login')
      navigate('/login')
    } catch (error) {
      const errorMessage = error.response?.data?.message
      message.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage || 'Register gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f0f2f5] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-200/80 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00a884] to-[#075e54] p-10 text-white lg:flex">
            <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                <span className="h-3 w-3 rounded-full bg-[#25d366]" />
                <span className="text-sm font-semibold tracking-wide">New Account</span>
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">Mulai percakapan baru.</h1>
              <p className="mt-5 text-lg leading-8 text-white/80">Buat akun dengan data valid dan password kuat agar akun chat kamu tetap aman.</p>
            </div>
            <div className="relative z-10 grid gap-3 rounded-3xl bg-white/15 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Password Rule</p>
              <p className="text-2xl font-black">8+ chars, uppercase, lowercase, special.</p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00a884] text-3xl font-black text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-950/30">
              C
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Create account</h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">Lengkapi data untuk bergabung ke ChatRealtime.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Username</span>
                <Input className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="alexchandra" value={form.username} onChange={(e) => updateForm('username', e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
                <Input className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="alexchandra@gmail.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Phone</span>
                <Input className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="0823888197372" value={form.phoneNumber} onChange={(e) => updateForm('phoneNumber', e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">About</span>
                <Input className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Available" value={form.about} onChange={(e) => updateForm('about', e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
                <Input.Password className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Contoh: Chandra@1998" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm Password</span>
                <Input.Password className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Ulangi password" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} />
              </label>
            </div>

            <div className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70 sm:grid-cols-2">
              {passwordChecks.map((rule) => (
                <div key={rule.label} className={rule.valid ? 'font-semibold text-[#00a884]' : 'text-slate-500 dark:text-slate-400'}>
                  {rule.valid ? '✓' : '•'} {rule.label}
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => navigate('/login')} className="h-12 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#00a884] font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-[#008f72] disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-emerald-950/30">
                {loading ? 'Loading...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Sudah punya akun?{' '}
            <button type="button" onClick={() => navigate('/login')} className="font-bold text-[#00a884] hover:text-[#008f72]">
              Login
            </button>
          </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
