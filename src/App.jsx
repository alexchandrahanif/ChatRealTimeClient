import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import store from './redux/store'
import { Provider } from 'react-redux'
import io from 'socket.io-client'
import { API_BASE_URL } from './config/api'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      query: {
        token: localStorage.getItem('authorization')
          ? localStorage.getItem('authorization')
          : null,
      },
    })
    window.chatSocket = newSocket
    return () => {
      newSocket.disconnect()
      window.chatSocket = null
    }
  }, [])

  return (
    <>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </>
  )
}

export default App
