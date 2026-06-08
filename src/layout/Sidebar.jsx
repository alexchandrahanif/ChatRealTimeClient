import { SearchOutlined } from '@ant-design/icons'
import { Dropdown, Input, Modal, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { FiEdit, FiLogOut } from 'react-icons/fi'
import { MdGroups } from 'react-icons/md'
import { HiEllipsisVertical } from 'react-icons/hi2'
import {
  IoChatbubbleEllipsesOutline,
  IoLogOutOutline,
  IoPersonAdd,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { MdOutlineDarkMode } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import {
  createContact,
  deleteContact,
  getAllContactPersonal,
  updateContact,
} from '../redux/action/contact'
import { getProfile } from '../redux/action/user'
import { createGroup, getAllGroupPersonal } from '../redux/action/group'
import { getConversations } from '../redux/action/chat'

const avatarUrl =
  'https://api.dicebear.com/8.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed='

const getAvatarSrc = (user, fallback) => {
  if (user?.avatar) return `${API_BASE_URL}/${user.avatar.replace(/^\.\//, '')}`
  return `${avatarUrl}${fallback || user?.username || 'User'}`
}

const Sidebar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { phoneNumber } = useParams()
  const { ContactPersonal } = useSelector((state) => state.ContactReducer)
  const { Profile } = useSelector((state) => state.UserReducer)
  const { GroupPersonal } = useSelector((state) => state.GroupReducer)
  const { Conversations } = useSelector((state) => state.ChatReducer)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('chats')
  const [openContact, setOpenContact] = useState(false)
  const [openLogout, setOpenLogout] = useState(false)
  const [openGroup, setOpenGroup] = useState(false)
  const [contactMode, setContactMode] = useState('create')
  const [selectedContact, setSelectedContact] = useState(null)
  const [newContact, setNewContact] = useState({ username: '', phoneNumber: '' })
  const [newGroup, setNewGroup] = useState({ name: '', description: '', memberIds: [] })
  const [openMemberPicker, setOpenMemberPicker] = useState(false)
  const [draftMemberIds, setDraftMemberIds] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )
  const username = Profile?.username || localStorage.getItem('username') || 'User'
  const about = Profile?.about || 'Available'

  useEffect(() => {
    dispatch(getProfile()).then((result) => {
      if (result?.data) {
        localStorage.setItem('username', result.data.username)
        localStorage.setItem('email', result.data.email)
        localStorage.setItem('phoneNumber', result.data.phoneNumber)
      }
    })
    dispatch(getAllContactPersonal())
    dispatch(getAllGroupPersonal())
    dispatch(getConversations())
  }, [dispatch])

  const contacts = useMemo(() => {
    return (ContactPersonal || []).filter((contact) => {
      const name = contact.username || contact.Teman?.username || ''
      const phone = contact.Teman?.phoneNumber || ''
      return `${name} ${phone}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [ContactPersonal, search])


  const conversations = useMemo(() => {
    return (Conversations || []).filter((conversation) => {
      const user = conversation.user || {}
      return `${user.username || ''} ${user.phoneNumber || ''}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [Conversations, search])

  const visibleContacts = contacts

  const groups = GroupPersonal || []

  const openCreateContact = () => {
    setContactMode('create')
    setSelectedContact(null)
    setNewContact({ username: '', phoneNumber: '' })
    setOpenContact(true)
  }

  const openEditContact = (contact) => {
    setContactMode('edit')
    setSelectedContact(contact)
    setNewContact({
      username: contact.username || contact.Teman?.username || '',
      phoneNumber: contact.Teman?.phoneNumber || '',
    })
    setOpenContact(true)
  }

  const handleSaveContact = async () => {
    if (!newContact.username.trim() || !newContact.phoneNumber.trim()) {
      message.error('Nama dan nomor telepon wajib diisi')
      return
    }

    const result =
      contactMode === 'edit'
        ? await dispatch(updateContact(selectedContact.id, { username: newContact.username }))
        : await dispatch(createContact(newContact))

    if (result?.statusCode === 200 || result?.statusCode === 201) {
      message.success(contactMode === 'edit' ? 'Kontak berhasil diupdate' : 'Kontak berhasil ditambahkan')
      setOpenContact(false)
      setNewContact({ username: '', phoneNumber: '' })
      setSelectedContact(null)
      dispatch(getAllContactPersonal())
    } else {
      message.error(result?.response?.data?.message || 'Gagal menyimpan kontak')
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      message.error('Nama group wajib diisi')
      return
    }

    const payload = new FormData()
    payload.append('name', newGroup.name)
    payload.append('description', newGroup.description)
    newGroup.memberIds.forEach((id) => payload.append('MemberId', id))

    const result = await dispatch(createGroup(payload))
    if (result?.statusCode === 201) {
      message.success('Group berhasil dibuat')
      setOpenGroup(false)
      setNewGroup({ name: '', description: '', memberIds: [] })
      dispatch(getAllGroupPersonal())
    dispatch(getConversations())
    } else {
      message.error(result?.response?.data?.message || 'Gagal membuat group')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  useEffect(() => {
    const socket = window.chatSocket
    if (!socket) return undefined

    const refreshPresence = () => {
      dispatch(getAllContactPersonal())
      dispatch(getConversations())
    }

    socket.on('updateOnlineStatus', refreshPresence)
    socket.on('newPersonalMessage', refreshPresence)
    socket.on('personalMessageUpdated', refreshPresence)
    socket.on('personalMessageDeleted', refreshPresence)
    return () => {
      socket.off('updateOnlineStatus', refreshPresence)
      socket.off('newPersonalMessage', refreshPresence)
      socket.off('personalMessageUpdated', refreshPresence)
      socket.off('personalMessageDeleted', refreshPresence)
    }
  }, [dispatch])

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode
    setIsDarkMode(nextMode)
    document.documentElement.classList.toggle('dark', nextMode)
    localStorage.setItem('theme', nextMode ? 'dark' : 'light')
  }

  const headerMenuItems = [
    {
      key: 'theme',
      label: isDarkMode ? 'Light mode' : 'Dark mode',
      icon: <MdOutlineDarkMode size={18} />,
      onClick: toggleDarkMode,
    },
    {
      key: 'group',
      label: 'Buat group',
      icon: <MdGroups size={18} />,
      onClick: () => setOpenGroup(true),
    },
    {
      key: 'contact',
      label: 'Tambah kontak',
      icon: <FiEdit size={18} />,
      onClick: openCreateContact,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <FiLogOut size={18} />,
      danger: true,
      onClick: () => setOpenLogout(true),
    },
  ]

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex h-16 shrink-0 items-center justify-between bg-[#f0f2f5] px-4 dark:bg-slate-800">
        <button onClick={() => navigate('/profile')} className="flex min-w-0 items-center gap-3 text-left">
          <img
            src={getAvatarSrc(Profile, username)}
            alt={username}
            className="h-11 w-11 rounded-full bg-slate-200 object-cover"
          />
          <div className="min-w-0 md:hidden lg:block">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{username}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{about}</p>
          </div>
        </button>
        <Dropdown menu={{ items: headerMenuItems }} trigger={['click']} placement="bottomRight">
          <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700" title="Menu">
            <HiEllipsisVertical size={24} />
          </button>
        </Dropdown>
      </header>

      <div className="border-b border-slate-100 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-3 px-1 text-2xl font-black text-slate-900 dark:text-white">ChatRealtime</h1>
        <div className="mb-3 grid grid-cols-3 gap-2 rounded-2xl bg-[#f0f2f5] p-1 dark:bg-slate-800">
          {[['chats', 'Chats'], ['contacts', 'Contacts'], ['groups', 'Groups']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`rounded-xl px-2 py-2 text-xs font-black transition ${activeTab === key ? 'bg-white text-[#00a884] shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <SearchOutlined className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start a new chat"
            className="h-11 rounded-xl border-none bg-[#f0f2f5] pl-11 text-sm shadow-none dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        {activeTab === 'groups' && groups.length > 0 ? (
          <div className="border-b border-slate-100 py-2 dark:border-slate-800">
            <p className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-400">Groups</p>
            {groups.map((group) => (
              <button key={group.id} onClick={() => navigate(`/group/${group.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                <img src={group.groupImage ? `${API_BASE_URL}/${group.groupImage.replace(/^\.\//, '')}` : `${avatarUrl}${group.name}`} className="h-12 w-12 rounded-full bg-emerald-100 object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{group.name}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{group.description || 'Group chat'}</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
        {activeTab === 'chats' && conversations.length > 0 ? (
          conversations.map((conversation) => {
            const friend = conversation.user || {}
            const contact = contacts.find((item) => item.Teman?.id === friend.id)
            const displayName = contact?.username || friend.phoneNumber || friend.username || 'Unknown'
            const isActive = friend.phoneNumber === phoneNumber
            const lastMessage = conversation.lastMessage

            return (
              <div key={friend.id} className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f5f6f6] dark:hover:bg-slate-800 ${isActive ? 'bg-[#f0f2f5] dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}>
                <button onClick={() => navigate(`/${friend.phoneNumber}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <img src={getAvatarSrc(friend, displayName)} alt={displayName} className="h-12 w-12 shrink-0 rounded-full bg-slate-200 object-cover" />
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-white">{displayName}</p>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{lastMessage?.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{lastMessage?.message || (lastMessage?.messageImage ? '📷 Gambar' : 'Mulai chat')}</p>
                  </div>
                </button>
              </div>
            )
          })
        ) : activeTab === 'contacts' && visibleContacts.length > 0 ? (
          visibleContacts.map((contact) => {
            const friend = contact.Teman || {}
            const displayName = contact.username || friend.username || 'Unknown'
            const isActive = friend.phoneNumber === phoneNumber

            return (
              <div
                key={contact.id || friend.id}
                className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f5f6f6] dark:hover:bg-slate-800 ${isActive ? 'bg-[#f0f2f5] dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
              >
                <button onClick={() => navigate(`/${friend.phoneNumber}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <img src={getAvatarSrc(friend, displayName)} alt={displayName} className="h-12 w-12 shrink-0 rounded-full bg-slate-200 object-cover" />
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-white">{displayName}</p>
                      <span className="inline-flex shrink-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        {friend.statusActive ? (
                          <>
                            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
                            Online
                          </>
                        ) : friend.lastLogin ? `Terakhir online ${new Date(friend.lastLogin).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Offline'}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{friend.about || 'Klik untuk mulai chat'}</p>
                  </div>
                </button>
              </div>
            )
          })
        ) : activeTab !== 'groups' ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f8f2] text-[#00a884]">
              <IoChatbubbleEllipsesOutline size={34} />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">{activeTab === 'chats' ? 'Belum ada chat' : 'Belum ada kontak'}</p>
            <p className="mt-2 text-sm leading-6">{activeTab === 'chats' ? 'Pilih kontak di tab Contacts untuk mulai chat.' : 'Tambahkan kontak dengan nomor yang sudah terdaftar.'}</p>
            {activeTab === 'contacts' ? (
              <button onClick={openCreateContact} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#00a884] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#008f72]">
                <IoPersonAdd /> Tambah kontak
              </button>
            ) : (
              <button onClick={() => setActiveTab('contacts')} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#00a884] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#008f72]">
                Buka Contacts
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f8f2] text-[#00a884]"><MdGroups size={34} /></div>
            <p className="font-bold text-slate-800 dark:text-white">Belum ada group</p>
            <p className="mt-2 text-sm leading-6">Buat group dari tombol group di atas.</p>
          </div>
        )}
      </div>

      <Modal open={openContact} onCancel={() => setOpenContact(false)} footer={null} centered width={460}>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="relative bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-7 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <IoPersonAdd size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black">{contactMode === 'edit' ? 'Update Kontak' : 'Tambah Kontak'}</h2>
                <p className="mt-1 text-sm text-white/75">Nama kontak bebas sesuai penyimpanan kamu.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nama Kontak</span>
              <Input className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white" value={newContact.username} onChange={(e) => setNewContact((prev) => ({ ...prev, username: e.target.value }))} placeholder="Nama kontak" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Nomor Telepon</span>
              <Input disabled={contactMode === 'edit'} className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white" value={newContact.phoneNumber} onChange={(e) => setNewContact((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="0823888197372" />
            </label>
            <div className="flex items-center gap-3 rounded-2xl bg-[#e7f8f2] p-4 text-sm text-[#075e54] dark:bg-emerald-950/40 dark:text-emerald-200">
              <IoShieldCheckmarkOutline size={22} />
              <p>{contactMode === 'edit' ? 'Nomor telepon tidak diubah, hanya nama simpanan kontak.' : 'Nomor harus milik user yang sudah register di ChatRealtime.'}</p>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button onClick={() => setOpenContact(false)} className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Batal
              </button>
              <button onClick={handleSaveContact} className="h-12 rounded-2xl bg-[#00a884] font-bold text-white transition hover:bg-[#008f72]">
                {contactMode === 'edit' ? 'Update Kontak' : 'Simpan Kontak'}
              </button>
            </div>
          </div>
        </div>
      </Modal>


      <Modal open={openGroup} onCancel={() => setOpenGroup(false)} footer={null} centered width={520}>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-7 text-white">
            <h2 className="text-xl font-black">Buat Group</h2>
            <p className="mt-1 text-sm text-white/75">Admin otomatis adalah pembuat group.</p>
          </div>
          <div className="space-y-4 p-6">
            <Input className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white" value={newGroup.name} onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nama group" />
            <Input className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white" value={newGroup.description} onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi group" />
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Peserta terpilih</p>
                <button onClick={() => { setDraftMemberIds(newGroup.memberIds); setOpenMemberPicker(true) }} className="rounded-full bg-[#00a884] px-4 py-2 text-sm font-bold text-white">Add</button>
              </div>
              {newGroup.memberIds.length ? (
                <div className="flex flex-wrap gap-2">
                  {newGroup.memberIds.map((id) => {
                    const contact = ContactPersonal.find((item) => item.Teman?.id === id)
                    return (
                      <span key={id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-white">
                        {contact?.username || contact?.Teman?.username || 'User'}
                        <button onClick={() => setNewGroup((prev) => ({ ...prev, memberIds: prev.memberIds.filter((memberId) => memberId !== id) }))} className="text-rose-500">×</button>
                      </span>
                    )
                  })}
                </div>
              ) : <p className="text-sm text-slate-400">Belum ada peserta. Klik Add untuk memilih kontak.</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setOpenGroup(false)} className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Batal</button>
              <button onClick={handleCreateGroup} className="h-12 rounded-2xl bg-[#00a884] font-bold text-white">Buat Group</button>
            </div>
          </div>
        </div>
      </Modal>


      <Modal open={openMemberPicker} onCancel={() => setOpenMemberPicker(false)} footer={null} centered width={520}>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-7 text-white">
            <h2 className="text-xl font-black">Pilih Peserta</h2>
            <p className="mt-1 text-sm text-white/75">Klik kontak untuk menambahkan checklist hijau.</p>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-5">
            {ContactPersonal.length ? ContactPersonal.map((contact) => {
              const checked = draftMemberIds.includes(contact.Teman?.id)
              return (
                <button key={contact.id} onClick={() => setDraftMemberIds((prev) => checked ? prev.filter((id) => id !== contact.Teman?.id) : [...prev, contact.Teman.id])} className={`mb-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${checked ? 'border-[#00a884] bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
                  <img src={getAvatarSrc(contact.Teman, contact.username)} className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{contact.username || contact.Teman?.username}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{contact.Teman?.about || contact.Teman?.phoneNumber}</p>
                  </div>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full font-black ${checked ? 'bg-[#00a884] text-white' : 'bg-white text-slate-300 dark:bg-slate-900'}`}>✓</span>
                </button>
              )
            }) : <p className="py-8 text-center text-slate-500">Belum ada kontak untuk dipilih.</p>}
          </div>
          <div className="grid gap-3 border-t border-slate-100 p-5 dark:border-slate-800 sm:grid-cols-2">
            <button onClick={() => setOpenMemberPicker(false)} className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Batal</button>
            <button onClick={() => { setNewGroup((prev) => ({ ...prev, memberIds: draftMemberIds })); setOpenMemberPicker(false) }} className="h-12 rounded-2xl bg-[#00a884] font-bold text-white">Oke</button>
          </div>
        </div>
      </Modal>

      <Modal open={openLogout} onCancel={() => setOpenLogout(false)} footer={null} centered width={420}>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-rose-500 to-orange-500 px-6 py-7 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <IoLogOutOutline size={30} />
              </div>
              <div>
                <h2 className="text-xl font-black">Konfirmasi Logout</h2>
                <p className="mt-1 text-sm text-white/80">Kamu yakin ingin keluar dari akun ini?</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-2">
            <button onClick={() => setOpenLogout(false)} className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Batal
            </button>
            <button onClick={handleLogout} className="h-12 rounded-2xl bg-rose-500 font-bold text-white transition hover:bg-rose-600">
              Ya, Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Sidebar
