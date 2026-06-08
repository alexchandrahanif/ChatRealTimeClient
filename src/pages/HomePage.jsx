import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'

const HomePage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#f0f2f5] px-8 text-center dark:bg-slate-900">
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#d9fdd3] text-[#00a884] shadow-lg shadow-emerald-100">
        <IoChatbubbleEllipsesOutline size={58} />
      </div>
      <h1 className="text-3xl font-light text-slate-800 dark:text-white sm:text-4xl">ChatRealtime Web</h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
        Pilih kontak di sidebar untuk mulai mengirim pesan. Tampilan ini dibuat responsive dengan nuansa WhatsApp Web.
      </p>
      <div className="mt-10 w-full max-w-md border-t border-slate-300 pt-5 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
        Pesan real-time, kontak, dan aktivitas online dalam satu layar.
      </div>
    </div>
  )
}

export default HomePage
