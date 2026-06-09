import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  const location = useLocation()
  const isDetailPage = location.pathname !== '/'
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
  ))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleChange = () => setIsDesktop(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const showSidebar = !isDetailPage || isDesktop
  const showContent = isDetailPage || isDesktop

  return (
    <main className="h-screen overflow-hidden bg-[#eae6df] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex h-full w-full max-w-[1600px] bg-[#f0f2f5] shadow-2xl dark:bg-slate-900 lg:h-[calc(100vh-32px)] lg:translate-y-4 lg:rounded-xl lg:border lg:border-white/60 lg:dark:border-slate-800">
        {showSidebar ? (
          <aside className="flex h-full w-full shrink-0 lg:w-[420px]">
            <Sidebar />
          </aside>
        ) : null}
        {showContent ? (
          <section className="flex h-full min-w-0 flex-1">
            <Outlet />
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default Layout
