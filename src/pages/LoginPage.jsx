import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Input, message } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../config/api'
import { normalizePhoneNumber, validatePhoneNumber } from '../utils/validation'

const LoginPage = () => {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePhoneNumber(phoneNumber)) {
      message.error('Format nomor telepon tidak valid. Contoh: 0823888197372')
      return
    }

    setLoading(true)

    try {
      const { data } = await api({
        url: '/user/login',
        method: 'POST',
        data: { phoneNumber: normalizePhoneNumber(phoneNumber), password },
      })

      localStorage.setItem('authorization', data.authorization)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      localStorage.setItem('phoneNumber', data.phoneNumber)
      message.success(`Selamat Datang ${data.username}!`)
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f0f2f5] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-200/80 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00a884] to-[#075e54] p-10 text-white lg:flex">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                <span className="h-3 w-3 rounded-full bg-[#25d366]" />
                <span className="text-sm font-semibold tracking-wide">ChatRealtime</span>
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">Selamat datang kembali.</h1>
              <p className="mt-5 text-lg leading-8 text-white/80">Login menggunakan nomor telepon untuk lanjut chat real-time dengan tampilan ala WhatsApp.</p>
            </div>
            <div className="relative z-10 rounded-3xl bg-white/15 p-6 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Secure Chat</p>
              <p className="mt-3 text-2xl font-black">Fast. Simple. Personal.</p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00a884] text-3xl font-black text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-950/30">
              C
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">Masuk dengan nomor telepon ChatRealtime kamu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Phone Number</span>
              <Input
                placeholder="0823888197372"
                size="large"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</span>
              <Input.Password
                size="large"
                placeholder="Masukkan password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#00a884] font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-[#008f72] disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-emerald-950/30"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <button type="button" onClick={() => navigate('/register')} className="font-bold text-[#00a884] hover:text-[#008f72]">
              Register
            </button>
          </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
