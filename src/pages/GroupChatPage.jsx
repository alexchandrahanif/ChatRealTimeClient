import { useEffect, useRef, useState } from 'react'
import { AiOutlinePaperClip } from 'react-icons/ai'
import { IoArrowBack, IoInformationCircleOutline, IoPeopleOutline } from 'react-icons/io5'
import { SlEmotsmile } from 'react-icons/sl'
import { VscSend } from 'react-icons/vsc'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Modal, Popover, message } from 'antd'
import { API_BASE_URL } from '../config/api'
import { createGroupChat, getAllGroupChatPersonal } from '../redux/action/chatGroup'
import { getOneGroup, memberLeaveGroup } from '../redux/action/group'

const avatarUrl = 'https://api.dicebear.com/8.x/shapes/svg?seed='
const emojis = ['😀', '😂', '😍', '🥳', '👍', '🙏', '🔥', '❤️', '😎', '😭', '😅', '👌']

const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const imageSrc = (path) => `${API_BASE_URL}/${path.replace(/^\.\//, '')}`

const GroupChatPage = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)
  const { Group } = useSelector((state) => state.GroupReducer)
  const { GroupChatPersonal } = useSelector((state) => state.GroupChatReducer)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [openInfo, setOpenInfo] = useState(false)
  const currentEmail = localStorage.getItem('email')

  useEffect(() => {
    dispatch(getOneGroup(groupId))
    dispatch(getAllGroupChatPersonal(groupId))
  }, [dispatch, groupId])

  const members = Group?.GroupMembers || []
  const adminName = Group?.User?.username || 'Admin'
  const isAdmin = members.some((member) => member.User?.email === currentEmail && member.status === 'ADMIN')
  const currentMember = members.find((member) => member.User?.email === currentEmail)

  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return message.warning('Pesan kosong')
    const payload = new FormData()
    payload.append('GroupId', groupId)
    payload.append('message', text.trim())
    if (imageFile) payload.append('messageImage', imageFile)
    const result = await dispatch(createGroupChat(payload))
    if (result?.statusCode === 201) {
      setText('')
      setImageFile(null)
      dispatch(getAllGroupChatPersonal(groupId))
    } else {
      message.error(result?.response?.data?.message || 'Gagal mengirim pesan group')
    }
  }

  const leaveGroup = async () => {
    const result = await dispatch(memberLeaveGroup(groupId, currentMember?.UserId))
    if (result?.statusCode === 200) {
      message.success('Berhasil keluar group')
      navigate('/')
    } else {
      message.error(result?.response?.data?.message || 'Gagal keluar group')
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#efeae2] dark:bg-slate-950">
      <header className="flex h-16 items-center justify-between bg-[#f0f2f5] px-4 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-full p-2 md:hidden"><IoArrowBack /></button>
          <img src={Group?.groupImage ? imageSrc(Group.groupImage) : `${avatarUrl}${Group?.name || 'group'}`} className="h-11 w-11 rounded-full object-cover" />
          <div>
            <p className="font-bold dark:text-white">{Group?.name || 'Group'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{members.length} peserta • dibuat oleh {adminName}</p>
          </div>
        </div>
        <button onClick={() => setOpenInfo(true)} className="rounded-full p-2 text-slate-600 dark:text-slate-300"><IoInformationCircleOutline size={24} /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          {(GroupChatPersonal || []).map((chat) => {
            const isMine = chat.PengirimGroup?.email === currentEmail
            return (
              <div key={chat.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow ${isMine ? 'bg-[#d9fdd3] dark:bg-emerald-900/70' : 'bg-white dark:bg-slate-800'}`}>
                  {!isMine ? <p className="mb-1 text-xs font-bold text-[#00a884]">{chat.PengirimGroup?.username}</p> : null}
                  {chat.messageImage ? <img src={imageSrc(chat.messageImage)} className="mb-2 max-h-72 rounded-xl" /> : null}
                  {chat.message ? <p className="whitespace-pre-wrap dark:text-white">{chat.message}</p> : null}
                  <p className="mt-1 text-right text-[11px] text-slate-500">{formatTime(chat.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {imageFile ? <div className="bg-[#f0f2f5] px-4 py-2 dark:bg-slate-800"><span className="rounded-xl bg-white px-3 py-2 text-sm dark:bg-slate-900 dark:text-white">{imageFile.name} <button onClick={() => setImageFile(null)} className="ml-2 text-rose-500">hapus</button></span></div> : null}
      <footer className="flex gap-2 bg-[#f0f2f5] px-4 py-3 dark:bg-slate-800">
        <Popover content={<div className="grid grid-cols-6 gap-2 text-xl">{emojis.map((emoji) => <button key={emoji} onClick={() => setText((prev) => `${prev}${emoji}`)}>{emoji}</button>)}</div>} trigger="click"><button><SlEmotsmile size={23} /></button></Popover>
        <button onClick={() => fileInputRef.current?.click()}><AiOutlinePaperClip size={24} /></button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} rows={1} className="min-h-[44px] flex-1 resize-none rounded-2xl border-none px-4 py-3 dark:bg-slate-900 dark:text-white" placeholder="Type group message" />
        <button onClick={sendMessage} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-white"><VscSend /></button>
      </footer>

      <Modal open={openInfo} onCancel={() => setOpenInfo(false)} footer={null} centered width={520}>
        <div className="rounded-3xl bg-white p-6 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <IoPeopleOutline size={28} className="text-[#00a884]" />
            <div><h2 className="text-xl font-black dark:text-white">{Group?.name}</h2><p className="text-sm text-slate-500">{Group?.description || 'Tidak ada deskripsi'}</p></div>
          </div>
          <p className="mb-3 text-sm text-slate-500">Dibuat oleh {adminName} pada {Group?.createdAt ? new Date(Group.createdAt).toLocaleString('id-ID') : '-'}</p>
          <div className="max-h-64 overflow-y-auto rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
            {members.map((member) => <div key={member.id} className="flex items-center justify-between border-b border-slate-200 py-2 last:border-0 dark:border-slate-700"><span className="dark:text-white">{member.User?.username}</span><span className="text-xs font-bold text-[#00a884]">{member.status}</span></div>)}
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={leaveGroup} className="h-11 flex-1 rounded-2xl bg-rose-500 font-bold text-white">Keluar Group</button>
            {isAdmin ? <button className="h-11 flex-1 rounded-2xl bg-[#00a884] font-bold text-white">Admin dapat add member via API</button> : null}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GroupChatPage
