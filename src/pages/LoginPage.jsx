import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Button, Input, Space, message } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Login } from '../assets'
import { api } from '../config/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = React.useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let body = {
        email,
        password,
      }

      let { data } = await api({
        url: '/user/login',
        method: 'POST',
        data: body,
      })

      localStorage.setItem('authorization', data.authorization)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      message.success(`Selamat Datang ${data.username}!`)
      navigate('/')
    } catch (error) {
      message.error(error.response.data.message)
    }
  }

  return (
    <div className="w-screen h-screen bg-slate-50 flex items-center">
      <div className="w-[60%] h-full p-5 flex justify-center items-center">
        <div className=" h-full w-full bg-slate-400 rounded-xl ">
          <img src={Login} alt="" className="rounded-xl" />
        </div>
      </div>
      <div className="w-[40%] h-full bg-slate-50 flex justify-center items-center">
        <div className="w-[400px]">
          <div className="text-hijau font-bold mb-3">
            <p className="text-[25px]">LOGIN</p>
          </div>
          <div className="text-slate-400 text-lg mb-5">
            <p>Welcome,</p>
            <p>Please login your account</p>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="text-slate-500">
                Email
              </label>
              <Input
                placeholder="Input Your Email"
                size="large"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-slate-500">
                Password
              </label>
              <Input.Password
                size="large"
                placeholder="input password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="off"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
              />
            </div>

            <div className="mt-5">
              <button
                className="w-full h-[40px] bg-hijau text-white font-bold"
                onClick={(e) => handleSubmit(e)}
              >
                Login
              </button>
            </div>

            <div className="flex justify-center">
              <p className="text-slate-500">
                Don&apos;t have an account?{' '}
                <span
                  className="text-hijau hover:cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  register
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
