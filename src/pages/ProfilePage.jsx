import { Input, Modal, Slider, message } from 'antd'
import { useEffect, useState } from 'react'
import {
  IoArrowBack,
  IoCameraOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
} from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { getProfile, updateProfile } from '../redux/action/user'
import {
  normalizePhoneNumber,
  validatePassword,
  validatePhoneNumber,
} from '../utils/validation'

const avatarFallback =
  'https://api.dicebear.com/8.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed='

const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { Profile } = useSelector((state) => state.UserReducer)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [rawAvatar, setRawAvatar] = useState(null)
  const [openCrop, setOpenCrop] = useState(false)
  const [cropZoom, setCropZoom] = useState(1)
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    about: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  useEffect(() => {
    if (Profile?.id) {
      setForm((prev) => ({
        ...prev,
        username: Profile.username || '',
        email: Profile.email || '',
        phoneNumber: Profile.phoneNumber || '',
        about: Profile.about || 'Available',
      }))

      setAvatarPreview(
        Profile.avatar
          ? `${API_BASE_URL}/${Profile.avatar.replace(/^\.\//, '')}`
          : `${avatarFallback}${Profile.username || 'User'}`,
      )
    }
  }, [Profile])

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleAvatarChange = (file) => {
    if (!file) return
    setRawAvatar(URL.createObjectURL(file))
    setCropZoom(1)
    setOpenCrop(true)
  }

  const applyAvatarCrop = async () => {
    const image = new Image()
    image.src = rawAvatar
    await new Promise((resolve) => {
      image.onload = resolve
    })

    const size = Math.min(image.width, image.height) / cropZoom
    const sourceX = (image.width - size) / 2
    const sourceY = (image.height - size) / 2
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 512, 512)

    canvas.toBlob((blob) => {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setOpenCrop(false)
      setRawAvatar(null)
    }, 'image/jpeg', 0.9)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.username.trim()) {
      message.error('Username wajib diisi')
      return
    }

    if (!validatePhoneNumber(form.phoneNumber)) {
      message.error('Format nomor telepon tidak valid')
      return
    }

    const wantsPasswordUpdate =
      form.currentPassword || form.newPassword || form.confirmPassword

    if (wantsPasswordUpdate) {
      if (!form.currentPassword) {
        message.error('Password sebelumnya wajib diisi')
        return
      }

      if (!validatePassword(form.newPassword)) {
        message.error(
          'Password baru minimal 8 karakter, ada huruf besar, huruf kecil, dan karakter spesial',
        )
        return
      }

      if (form.newPassword !== form.confirmPassword) {
        message.error('Password baru dan konfirmasi password tidak sama')
        return
      }
    }

    const payload = new FormData()
    payload.append('username', form.username)
    payload.append('phoneNumber', normalizePhoneNumber(form.phoneNumber))
    payload.append('about', form.about)
    if (wantsPasswordUpdate) {
      payload.append('currentPassword', form.currentPassword)
      payload.append('newPassword', form.newPassword)
      payload.append('confirmPassword', form.confirmPassword)
    }
    if (avatarFile) payload.append('avatar', avatarFile)

    setLoading(true)
    const result = await dispatch(updateProfile(payload))
    setLoading(false)

    if (result?.statusCode === 200) {
      localStorage.setItem('username', result.data.username)
      localStorage.setItem('email', result.data.email)
      localStorage.setItem('phoneNumber', result.data.phoneNumber)
      message.success('Profile berhasil diperbarui')
      setAvatarFile(null)
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } else {
      const errorMessage = result?.response?.data?.message
      message.error(
        Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage || 'Gagal update profile',
      )
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#f0f2f5] dark:bg-slate-900">
      <header className="flex h-16 shrink-0 items-center gap-3 border-l border-slate-200 bg-[#f0f2f5] px-4 dark:border-slate-800 dark:bg-slate-800">
        <button
          onClick={() => navigate('/')}
          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 md:hidden"
        >
          <IoArrowBack size={22} />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">
          Profile
        </h1>
      </header>

      <main className="flex flex-1 items-start justify-center overflow-y-auto p-4 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-200/70 dark:bg-slate-800 dark:shadow-black/20"
        >
          <section className="relative bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-8 text-white sm:px-8">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-white/10" />
            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <label className="group relative shrink-0 cursor-pointer">
                <img
                  src={
                    avatarPreview ||
                    `${avatarFallback}${form.username || 'User'}`
                  }
                  alt={form.username || 'Profile'}
                  className="h-32 w-32 rounded-full bg-white/20 object-cover ring-4 ring-white/40"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
                  <IoCameraOutline size={34} />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleAvatarChange(e.target.files?.[0] || null)
                  }
                />
              </label>
              <div className="min-w-0">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                  <IoPersonOutline /> Personal Profile
                </p>
                <h2 className="truncate text-3xl font-black">
                  {form.username || 'Your Profile'}
                </h2>
              </div>
            </div>
          </section>

          <section className="grid gap-6 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Username
                </span>
                <Input
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={form.username}
                  onChange={(e) => updateForm('username', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <IoMailOutline /> Email Read-only
                </span>
                <Input
                  disabled
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 px-4 text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                  value={form.email}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Phone Number
                </span>
                <Input
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={form.phoneNumber}
                  onChange={(e) => updateForm('phoneNumber', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  About
                </span>
                <Input
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={form.about}
                  onChange={(e) => updateForm('about', e.target.value)}
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#d9fdd3] text-[#00a884] dark:bg-emerald-950">
                  <IoLockClosedOutline size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">
                    Update Password
                  </h3>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input.Password
                  className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white"
                  placeholder="Password sebelumnya"
                  value={form.currentPassword}
                  onChange={(e) =>
                    updateForm('currentPassword', e.target.value)
                  }
                />
                <Input.Password
                  className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white"
                  placeholder="Password baru"
                  value={form.newPassword}
                  onChange={(e) => updateForm('newPassword', e.target.value)}
                />
                <Input.Password
                  className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white"
                  placeholder="Konfirmasi password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateForm('confirmPassword', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-12 rounded-2xl border border-slate-200 px-6 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-2xl bg-[#00a884] px-8 font-bold text-white transition hover:bg-[#008f72] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </section>
        </form>
      </main>

      <Modal open={openCrop} onCancel={() => setOpenCrop(false)} footer={null} centered width={430}>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-6 text-white">
            <h2 className="text-xl font-black">Crop Avatar</h2>
            <p className="mt-1 text-sm text-white/75">Atur preview agar avatar tetap 1:1.</p>
          </div>
          <div className="p-6">
            <div className="mx-auto h-64 w-64 overflow-hidden rounded-full bg-slate-100">
              {rawAvatar ? <img src={rawAvatar} alt="Crop preview" className="h-full w-full object-cover" style={{ transform: `scale(${cropZoom})` }} /> : null}
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Zoom</p>
              <Slider min={1} max={2.5} step={0.1} value={cropZoom} onChange={setCropZoom} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={() => setOpenCrop(false)} className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Batal</button>
              <button onClick={applyAvatarCrop} className="h-12 rounded-2xl bg-[#00a884] font-bold text-white">Gunakan Avatar</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage
