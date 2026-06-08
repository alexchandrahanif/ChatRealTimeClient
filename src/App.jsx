import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import store from './redux/store'
import { Provider } from 'react-redux'
import io from 'socket.io-client'
import { API_BASE_URL } from './config/api'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      query: {
        token: localStorage.getItem('authorization')
          ? localStorage.getItem('authorization')
          : null,
      },
    })
    return () => {
      newSocket.disconnect()
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
