import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  const location = useLocation()
  const isDetailPage = location.pathname !== '/'

  return (
    <main className="h-screen overflow-hidden bg-[#eae6df] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex h-full w-full max-w-[1600px] bg-[#f0f2f5] shadow-2xl dark:bg-slate-900 lg:h-[calc(100vh-32px)] lg:translate-y-4 lg:rounded-xl lg:border lg:border-white/60 lg:dark:border-slate-800">
        <aside className={`${isDetailPage ? 'hidden md:flex' : 'flex'} h-full w-full shrink-0 md:w-[380px] lg:w-[420px]`}>
          <Sidebar />
        </aside>
        <section className={`${isDetailPage ? 'flex' : 'hidden md:flex'} h-full min-w-0 flex-1`}>
          <Outlet />
        </section>
      </div>
    </main>
  )
}

export default Layout
