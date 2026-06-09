import { useEffect, useRef, useState } from 'react'
import { AiOutlinePaperClip } from 'react-icons/ai'
import { HiMiniMicrophone } from 'react-icons/hi2'
import { HiOutlinePhone, HiOutlineVideoCamera } from 'react-icons/hi'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'
import {
  IoArrowBack,
  IoCheckmarkDone,
  IoInformationCircleOutline,
  IoPersonAdd,
  IoTrashOutline,
} from 'react-icons/io5'
import { SlEmotsmile } from 'react-icons/sl'
import { VscSend } from 'react-icons/vsc'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Dropdown, Input, Modal, Popover, message } from 'antd'
import { API_BASE_URL } from '../config/api'
import {
  createChat,
  deleteChat,
  getAllChatPersonal,
  updateChat,
  updateStatusChat,
} from '../redux/action/chat'
import {
  createContact,
  deleteContact,
  getAllContactPersonal,
  getOneContact,
  updateContact,
} from '../redux/action/contact'
import { getOneUser, getProfile } from '../redux/action/user'
import { cropImageToSquare } from '../utils/cropImage'

const avatarUrl =
  'https://api.dicebear.com/8.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed='
const emojis = [
  '😀',
  '😂',
  '😍',
  '🥳',
  '👍',
  '🙏',
  '🔥',
  '❤️',
  '😎',
  '😭',
  '😅',
  '👌',
]

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getAvatarSrc = (user, fallback) => {
  if (user?.avatar) return `${API_BASE_URL}/${user.avatar.replace(/^\.\//, '')}`
  return `${avatarUrl}${fallback || user?.username || 'User'}`
}

const ReadReceipt = ({ chat, receiver }) => {
  if (chat.readMessageStatus) {
    return <IoCheckmarkDone className="text-[#53bdeb]" />
  }

  if (receiver?.statusActive) {
    return <IoCheckmarkDone className="text-slate-400 dark:text-slate-500" />
  }

  return <IoCheckmark className="text-slate-400 dark:text-slate-500" />
}

const ChatPage = () => {
  const { phoneNumber } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { Contact } = useSelector((state) => state.ContactReducer)
  const { Profile, User } = useSelector((state) => state.UserReducer)
  const { ChatPersonal } = useSelector((state) => state.ChatReducer)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [typingUserId, setTypingUserId] = useState(null)
  const [openSaveContact, setOpenSaveContact] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [contactName, setContactName] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [editText, setEditText] = useState('')

  const cropSelectedImage = async (index) => {
    const cropped = await cropImageToSquare(imageFiles[index])
    setImageFiles((prev) => prev.map((file, fileIndex) => (fileIndex === index ? cropped : file)))
  }

  const contactFriend = Contact?.Teman
  const friend =
    contactFriend?.phoneNumber === phoneNumber ? contactFriend : User
  const savedContactName =
    contactFriend?.phoneNumber === phoneNumber ? Contact.username : null
  const friendName =
    savedContactName || friend?.username || phoneNumber || 'Contact'
  const currentEmail = localStorage.getItem('email')
  const messages = ChatPersonal || []
  const lastMessage = messages[messages.length - 1]
  const isSavedContact = Boolean(savedContactName)

  useEffect(() => {
    dispatch(getProfile())
    dispatch(getOneContact(phoneNumber))
    dispatch(getOneUser(phoneNumber))
  }, [dispatch, phoneNumber])

  useEffect(() => {
    if (friend?.id) {
      dispatch(getAllChatPersonal(friend.id))
    }
  }, [dispatch, friend?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (!friend?.id || !Profile?.id) return

    const hasUnreadIncomingMessage = messages.some(
      (chat) =>
        String(chat.SenderId) === String(friend.id) && !chat.readMessageStatus,
    )

    if (!hasUnreadIncomingMessage) return

    dispatch(updateStatusChat(friend.id)).then(() => {
      dispatch(getAllChatPersonal(friend.id))
    })
  }, [Profile?.id, dispatch, friend?.id, messages])

  useEffect(() => {
    const socket = window.chatSocket
    if (!socket) return undefined

    const handleTyping = ({ userId, ReceiverId, isTyping }) => {
      if (
        ReceiverId &&
        Profile?.id &&
        Number(ReceiverId) !== Number(Profile.id)
      )
        return
      setTypingUserId(isTyping ? userId : null)
    }
    const handleOnlineStatus = () => {
      dispatch(getOneUser(phoneNumber))
    }
    const handleNewMessage = ({ SenderId, ReceiverId }) => {
      if (friend?.id && (SenderId === friend.id || ReceiverId === friend.id)) {
        dispatch(getAllChatPersonal(friend.id))
      }
    }
    const handleMessageChange = ({ SenderId, ReceiverId }) => {
      if (friend?.id && (SenderId === friend.id || ReceiverId === friend.id)) {
        dispatch(getAllChatPersonal(friend.id))
      }
    }

    socket.on('userTyping', handleTyping)
    socket.on('updateOnlineStatus', handleOnlineStatus)
    socket.on('newPersonalMessage', handleNewMessage)
    socket.on('personalMessageUpdated', handleMessageChange)
    socket.on('personalMessageDeleted', handleMessageChange)
    return () => {
      socket.off('userTyping', handleTyping)
      socket.off('updateOnlineStatus', handleOnlineStatus)
      socket.off('newPersonalMessage', handleNewMessage)
      socket.off('personalMessageUpdated', handleMessageChange)
      socket.off('personalMessageDeleted', handleMessageChange)
    }
  }, [Profile?.id, dispatch, friend?.id, phoneNumber])

  const sendMessage = async () => {
    if (!text.trim() && imageFiles.length === 0) {
      message.warning('Teks pesan kosong')
      return
    }

    if (!friend?.id) {
      message.error('User tujuan belum siap')
      return
    }

    const payload = new FormData()
    payload.append('ReceiverId', friend.id)
    payload.append('message', text.trim())
    imageFiles.forEach((file) => payload.append('messageImage', file))

    setSending(true)
    const result = await dispatch(createChat(payload))
    setSending(false)

    if (result?.statusCode === 201) {
      setText('')
      setImageFiles([])
      dispatch(getAllChatPersonal(friend.id))
    } else {
      message.error(result?.response?.data?.message || 'Gagal mengirim pesan')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSaveContact = async () => {
    if (!contactName.trim()) {
      message.error('Nama kontak wajib diisi')
      return
    }

    const result = await dispatch(
      createContact({ username: contactName, phoneNumber }),
    )
    if (result?.statusCode === 201) {
      message.success('Kontak berhasil disimpan')
      setOpenSaveContact(false)
      dispatch(getAllContactPersonal())
      dispatch(getOneContact(phoneNumber))
    } else {
      message.error(result?.response?.data?.message || 'Gagal simpan kontak')
    }
  }

  const handleUpdateContactName = async () => {
    if (!Contact?.id || !contactName.trim()) return
    const result = await dispatch(
      updateContact(Contact.id, { username: contactName }),
    )
    if (result?.statusCode === 200) {
      message.success('Nama kontak berhasil diupdate')
      dispatch(getAllContactPersonal())
      dispatch(getOneContact(phoneNumber))
      setOpenDetail(false)
    } else {
      message.error(result?.response?.data?.message || 'Gagal update kontak')
    }
  }

  const handleDeleteContact = async () => {
    if (!Contact?.id) return
    const result = await dispatch(deleteContact(Contact.id))
    if (result?.statusCode === 200) {
      message.success('Kontak dihapus, chat tetap tersimpan')
      dispatch(getAllContactPersonal())
      dispatch(getOneContact(phoneNumber))
      setOpenDetail(false)
    } else {
      message.error(result?.response?.data?.message || 'Gagal hapus kontak')
    }
  }

  const refreshMessages = () => {
    if (friend?.id) dispatch(getAllChatPersonal(friend.id))
  }

  const openEditMessage = (chat) => {
    setEditingMessage(chat)
    setEditText(chat.message || '')
  }

  const handleUpdateMessage = async () => {
    if (!editingMessage || !editText.trim()) return
    const result = await dispatch(
      updateChat(editingMessage.id, { message: editText.trim() }),
    )

    if (result?.statusCode === 200) {
      message.success('Pesan berhasil diedit')
      setEditingMessage(null)
      setEditText('')
      refreshMessages()
    } else {
      message.error(result?.response?.data?.message || 'Gagal edit pesan')
    }
  }

  const handleWithdrawMessage = (chat) => {
    Modal.confirm({
      title: 'Tarik pesan?',
      content:
        'Pesan akan diganti menjadi “Pesan ditarik” untuk percakapan ini.',
      okText: 'Tarik',
      cancelText: 'Batal',
      centered: true,
      onOk: async () => {
        const result = await dispatch(
          updateChat(chat.id, { message: 'Pesan ditarik', action: 'withdraw' }),
        )
        if (result?.statusCode === 200) {
          message.success('Pesan berhasil ditarik')
          refreshMessages()
        } else {
          message.error(result?.response?.data?.message || 'Gagal tarik pesan')
        }
      },
    })
  }

  const handleDeleteMessage = (chat) => {
    Modal.confirm({
      title: 'Hapus pesan?',
      content: 'Pesan akan dihapus dari database.',
      okText: 'Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        const result = await dispatch(deleteChat(chat.id))
        if (result?.statusCode === 200) {
          message.success('Pesan berhasil dihapus')
          refreshMessages()
        } else {
          message.error(result?.response?.data?.message || 'Gagal hapus pesan')
        }
      },
    })
  }

  const handleMessageAction = (key, chat) => {
    if (key === 'edit') {
      openEditMessage(chat)
      return
    }

    if (key === 'withdraw') {
      handleWithdrawMessage(chat)
      return
    }

    if (key === 'delete') {
      handleDeleteMessage(chat)
    }
  }

  const chatHeaderItems = [
    !isSavedContact
      ? {
          key: 'save',
          label: 'Simpan kontak',
          icon: <IoPersonAdd size={18} />,
          onClick: () => {
            setContactName(friend?.username || '')
            setOpenSaveContact(true)
          },
        }
      : null,
    {
      key: 'phone',
      label: 'Panggilan suara',
      icon: <HiOutlinePhone size={18} />,
    },
    {
      key: 'video',
      label: 'Panggilan video',
      icon: <HiOutlineVideoCamera size={18} />,
    },
    {
      key: 'detail',
      label: 'Info kontak',
      icon: <IoInformationCircleOutline size={18} />,
      onClick: () => {
        setContactName(savedContactName || friend?.username || '')
        setOpenDetail(true)
      },
    },
  ].filter(Boolean)

  return (
    <div className="flex h-full w-full flex-col bg-[#efeae2] dark:bg-slate-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-l border-slate-200 bg-[#f0f2f5] px-3 dark:border-slate-800 dark:bg-slate-800 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 md:hidden"
          >
            <IoArrowBack size={22} />
          </button>
          <button
            onClick={() => {
              setContactName(savedContactName || friend?.username || '')
              setOpenDetail(true)
            }}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="relative shrink-0">
              <img
                src={getAvatarSrc(friend, friendName)}
                alt={friendName}
                className="h-11 w-11 rounded-full bg-slate-200 object-cover"
              />
              {User?.statusActive ? (
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </span>
              ) : null}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-slate-900 dark:text-white">
                {friendName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {typingUserId === friend?.id
                  ? 'sedang mengetik...'
                  : User?.statusActive
                    ? 'Online'
                    : lastMessage?.createdAt
                      ? `Chat terakhir ${formatTime(lastMessage.createdAt)}`
                      : friend?.about || 'Offline'}
              </p>
            </div>
          </button>
        </div>
        <Dropdown
          menu={{ items: chatHeaderItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Menu chat"
          >
            <HiEllipsisVertical size={24} />
          </button>
        </Dropdown>
      </header>

      <section className="relative flex-1 overflow-y-auto px-3 py-5 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#111 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col gap-2">
          {messages.length > 0 ? (
            messages.map((chat) => {
              const isMine =
                chat.SenderId === Profile?.id ||
                chat.Pengirim?.email === currentEmail
              const imageUrl = chat.messageImage
                ? `${API_BASE_URL}/${chat.messageImage.replace(/^\.\//, '')}`
                : null
              const messageItems = [
                {
                  key: 'edit',
                  label: 'Edit pesan',
                  disabled: chat.message === 'Pesan ditarik',
                },
                {
                  key: 'withdraw',
                  label: 'Tarik pesan',
                  disabled: chat.message === 'Pesan ditarik',
                },
                { key: 'delete', label: 'Hapus pesan', danger: true },
              ]
              return (
                <div
                  key={chat.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-[82%] rounded-2xl px-4 py-2 text-sm shadow-sm sm:max-w-[68%] ${isMine ? 'rounded-tr-sm bg-[#d9fdd3] dark:bg-emerald-900/70' : 'rounded-tl-sm bg-white dark:bg-slate-800'}`}
                  >
                    {isMine ? (
                      <Dropdown
                        menu={{
                          items: messageItems,
                          onClick: ({ key }) => handleMessageAction(key, chat),
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <button
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-1 top-1 rounded-full bg-white/70 p-1 text-slate-500 opacity-100 shadow-sm transition hover:text-slate-800 dark:bg-slate-900/70 dark:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Aksi pesan"
                        >
                          <HiEllipsisVertical size={16} />
                        </button>
                      </Dropdown>
                    ) : null}
                    {imageUrl ? (
                      <button onClick={() => setPreviewImage(imageUrl)}>
                        <img
                          src={imageUrl}
                          alt="attachment"
                          className="mb-2 max-h-72 rounded-xl object-cover transition hover:opacity-90"
                        />
                      </button>
                    ) : null}
                    {chat.message ? (
                      <p className="whitespace-pre-wrap break-words leading-6 text-slate-800 dark:text-slate-100">
                        {chat.message}
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
                      <span>{formatTime(chat.createdAt)}</span>
                      {chat.isUpdate ? <span>edited</span> : null}
                      {isMine ? (
                        <ReadReceipt chat={chat} receiver={friend} />
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="rounded-2xl bg-white/80 px-5 py-3 text-center text-sm text-slate-500 shadow-sm dark:bg-slate-800/80 dark:text-slate-300">
                Belum ada pesan. Mulai percakapan dengan {friendName}.
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </section>

      {imageFiles.length ? (
        <div className="bg-[#f0f2f5] px-4 py-2 dark:bg-slate-800">
          <div className="flex gap-3 overflow-x-auto rounded-2xl bg-white p-3 text-sm dark:bg-slate-900 dark:text-white">
            {imageFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative shrink-0">
                <img src={URL.createObjectURL(file)} className="h-20 w-20 rounded-xl object-cover" />
                <button onClick={() => cropSelectedImage(index)} className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">crop</button>
                <button onClick={() => setImageFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-rose-500 text-xs font-black text-white">×</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <footer className="flex shrink-0 items-end gap-2 bg-[#f0f2f5] px-3 py-3 dark:bg-slate-800 sm:px-4">
        <Popover
          content={
            <div className="grid grid-cols-6 gap-2 text-xl">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setText((prev) => `${prev}${emoji}`)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          }
          trigger="click"
        >
          <button className="mb-1 hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 sm:block">
            <SlEmotsmile size={23} />
          </button>
        </Popover>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mb-1 rounded-full p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <AiOutlinePaperClip size={24} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setImageFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
        />
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            window.chatSocket?.emit('typing', { ReceiverId: friend?.id })
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              window.chatSocket?.emit('stopTyping', { ReceiverId: friend?.id })
            }, 1000)
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border-none bg-white px-4 py-3 text-[15px] leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#00a884]/20 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />
        <button
          onClick={text.trim() || imageFiles.length ? sendMessage : undefined}
          disabled={sending}
          className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#008f72] disabled:opacity-70"
        >
          {text.trim() || imageFiles.length ? (
            <VscSend size={22} />
          ) : (
            <HiMiniMicrophone size={22} />
          )}
        </button>
      </footer>

      <Modal
        open={Boolean(previewImage)}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width="80vw"
      >
        <div className="flex max-h-[80vh] items-center justify-center rounded-2xl bg-black p-3">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[76vh] max-w-full rounded-xl object-contain"
            />
          ) : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(editingMessage)}
        onCancel={() => setEditingMessage(null)}
        footer={null}
        centered
        width={460}
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-7 text-white">
            <h2 className="text-xl font-black">Edit Pesan</h2>
            <p className="mt-1 text-sm text-white/75">
              Perubahan pesan akan tersimpan aman dan terenkripsi di database.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Input.TextArea
              rows={4}
              className="rounded-2xl dark:bg-slate-800 dark:text-white"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Tulis pesan baru"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setEditingMessage(null)}
                className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateMessage}
                className="h-12 rounded-2xl bg-[#00a884] font-bold text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
        centered
        width={460}
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-8 text-center text-white">
            <img
              src={getAvatarSrc(friend, friendName)}
              alt={friendName}
              className="mx-auto h-28 w-28 rounded-full border-4 border-white/40 object-cover"
            />
            <h2 className="mt-4 text-2xl font-black">{friendName}</h2>
            <p className="mt-1 text-sm text-white/75">{friend?.phoneNumber}</p>
          </div>
          <div className="space-y-4 p-6">
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800 dark:text-white">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">About</span>
                <span className="text-right font-semibold">
                  {friend?.about || '-'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="text-right font-semibold">
                  {User?.statusActive
                    ? 'Online'
                    : User?.lastLogin
                      ? `Terakhir online ${formatTime(User.lastLogin)}`
                      : 'Offline'}
                </span>
              </div>
            </div>
            {isSavedContact ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Nama kontak
                  </span>
                  <Input
                    className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleDeleteContact}
                    className="h-12 rounded-2xl bg-rose-500 font-bold text-white"
                  >
                    <IoTrashOutline className="inline" /> Hapus Kontak
                  </button>
                  <button
                    onClick={handleUpdateContactName}
                    className="h-12 rounded-2xl bg-[#00a884] font-bold text-white"
                  >
                    Update Nama
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpenDetail(false)
                  setOpenSaveContact(true)
                }}
                className="h-12 w-full rounded-2xl bg-[#00a884] font-bold text-white"
              >
                <IoPersonAdd className="inline" /> Tambah sebagai kontak
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={openSaveContact}
        onCancel={() => setOpenSaveContact(false)}
        footer={null}
        centered
        width={420}
      >
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#00a884] to-[#075e54] px-6 py-7 text-white">
            <h2 className="text-xl font-black">Simpan Kontak</h2>
            <p className="mt-1 text-sm text-white/75">
              Kontak belum tersimpan. Beri nama sesuai keinginan kamu.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Input
              className="h-12 rounded-2xl dark:bg-slate-800 dark:text-white"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nama kontak"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setOpenSaveContact(false)}
                className="h-12 rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveContact}
                className="h-12 rounded-2xl bg-[#00a884] font-bold text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ChatPage
