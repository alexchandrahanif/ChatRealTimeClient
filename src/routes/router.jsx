import { createBrowserRouter, redirect } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ChatPage from '../pages/ChatPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import GroupChatPage from '../pages/GroupChatPage'
import Layout from '../layout/layout'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    loader: () => {
      if (localStorage.getItem('authorization')) {
        throw redirect('/')
      }
      return null
    },
  },
  {
    path: '/register',
    element: <RegisterPage />,
    loader: () => {
      if (localStorage.getItem('authorization')) {
        throw redirect('/')
      }
      return null
    },
  },
  {
    path: '/',
    element: <Layout />,
    loader: () => {
      if (!localStorage.getItem('authorization')) {
        throw redirect('/login')
      }
      return null
    },
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/group/:groupId',
        element: <GroupChatPage />,
      },
      {
        path: '/:phoneNumber',
        element: <ChatPage />,
      },
    ],
  },
])

export default router
