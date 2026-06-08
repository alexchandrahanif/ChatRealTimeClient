import { Input, Popover, Tooltip, message, Button, Modal } from 'antd'
import React, { useEffect, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import { FiEdit, FiLogOut } from 'react-icons/fi'
import { PiChecksBold } from 'react-icons/pi'
import { CiLogout } from 'react-icons/ci'
import { RiContactsBookLine, RiContactsBookFill } from 'react-icons/ri'
import { HiEllipsisVertical } from 'react-icons/hi2'
import { IoPersonAdd } from 'react-icons/io5'

import {
  MdDarkMode,
  MdOutlineDarkMode,
  MdManageAccounts,
  MdFullscreenExit,
  MdOutlineFullscreen,
} from 'react-icons/md'
import {
  IoChatbubbleEllipsesOutline,
  IoChatbubblesOutline,
  IoCallOutline,
  IoSettingsOutline,
} from 'react-icons/io5'
import { LuSquarePlus } from 'react-icons/lu'

import { useNavigate } from 'react-router-dom'
import potongString from '../utils/String'
import { Logo } from '../assets'
import axios from 'axios'
import { createContact, getAllContactPersonal } from '../redux/action/contact'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

let data = [
  {
    id: 1,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang',
  },
  { id: 2, nama: 'Alex Chandra', jam: '10:10', last: 'Oke Bang' },
  { id: 3, nama: 'Alex Chandra', jam: '10:10', last: 'Oke Bang' },
  {
    id: 4,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 5,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 6,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 7,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 8,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 9,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
  {
    id: 10,
    nama: 'Alex Chandra',
    jam: '10:10',
    last: 'Oke Bang mantap bener dah pokoknya mantap',
  },
]

let dataContact = [
  {
    id: 1,
    nama: 'Alex Chandra Hanif',
    about: 'Sibuk',
  },
  { id: 2, nama: 'Saber Roam', about: 'Sibuk' },
  { id: 3, nama: 'Kagura', about: 'Sibuk' },
  {
    id: 4,
    nama: 'Zilong',
    about: 'Sibuk',
  },
  {
    id: 5,
    nama: 'Pascol',
    about: 'Sibuk',
  },
  {
    id: 6,
    nama: 'Natan',
    about: 'Sibuk',
  },
  {
    id: 7,
    nama: 'Balmond',
    about: 'Sibuk',
  },
  {
    id: 8,
    nama: 'Hababi',
    about: 'Sibuk',
  },
  {
    id: 9,
    nama: 'Cyclops',
    about: 'Sibuk',
  },
  {
    id: 10,
    nama: 'Vale',
    about: 'Sibuk',
  },
]

let dataMenu = [
  {
    id: 1,
    nama: 'Chat',
    logo: <IoChatbubbleEllipsesOutline />,
  },
  {
    id: 2,
    nama: 'Group',
    logo: <IoChatbubblesOutline />,
  },
  {
    id: 4,
    nama: 'Panggilan',
    logo: <IoCallOutline />,
  },
  {
    id: 5,
    nama: 'Setting',
    logo: <IoSettingsOutline />,
  },
]

const Sidabar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedItemId, setSelectedItemId] = useState(null)
  const [selectedMenuId, setSelectedMenuId] = useState(1)
  const [isDark, setIsDark] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [openContact, setOpenContact] = useState(false)
  const [menu, setMenu] = useState('Chat')

  const [openAddContact, setOpenAddContact] = useState(false)

  const handleOpenChange = (newOpen) => {
    setOpenContact(newOpen)
  }

  const handleDarkMode = () => {
    setIsDark(!isDark)
    const html = document.querySelector('html')
    if (!isDark) {
      html.classList.add('dark')
      localStorage.setItem('darkmode', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('darkmode', 'light')
    }
  }

  const { ContactPersonal } = useSelector((state) => state.ContactReducer)
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleItemChat = (id) => {
    navigate(`/${id}`)
    setSelectedItemId(id)
    setSelectedItemId(null)
  }

  let handleClickContact = (id) => {
    navigate(`/${id}`)
    setSelectedItemId(id)
    setSelectedMenuId(1)
    setMenu('Chat')
  }

  const handleItemMenu = (id, nama) => {
    setSelectedMenuId(id)
    setMenu(nama)
  }

  const handleAddContact = async () => {
    const data = {
      username,
      phoneNumber,
    }
    await dispatch(createContact(data))
      .then((data) =>
        message.loading('Loading', 1, () => {
          if (data?.statusCode == 201) {
            message.success(data.message, 1, () => {
              dispatch(getAllContactPersonal())
              setOpenAddContact(false)
              setUsername('')
              setPhoneNumber('')
            })
          } else {
            message.error(data?.response.data.message)
          }
        })
      )
      .catch((error) => console.log(error))
  }

  const handleLogout = () => {
    message.success(
      `Selamat datang kembali ${localStorage.getItem('username')}`
    )
    localStorage.clear()
    navigate('/login')
  }

  const toggleFullscreen = () => {
    const element = document.documentElement

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const contentTitikChat = (
    <div className={`flex flex-col w-[90px] gap-1 `}>
      <button
        className="px-2 py-2 flex items-center  h-[32px] font-medium cursor-pointer  rounded-md  gap-1 hover:bg-sky-700 hover:text-white"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <MdOutlineFullscreen /> : <MdFullscreenExit />}
        {isFullscreen ? 'Normal' : 'Full'}
      </button>
      <button
        className="px-2 py-2 flex items-center  h-[32px] font-medium cursor-pointer  rounded-md  gap-1 hover:bg-sky-700 hover:text-white"
        onClick={() => handleLogout()}
      >
        <FiLogOut /> Logout
      </button>
    </div>
  )

  const contentTitikContact = (
    <div className={`flex flex-col w-[90px] gap-1 `}>
      <button
        className="py-1 px-2 flex items-center  h-[32px] font-medium cursor-pointer  rounded-md  gap-1 hover:bg-sky-700 hover:text-white"
        onClick={() => {}}
      >
        <LuSquarePlus /> Contact
      </button>
    </div>
  )

  const contentContact = (
    <div className="w-[250px]">
      <div className="w-full flex justify-evenly items-center">
        <Input
          placeholder="Search user"
          size="small"
          className="w-[80%] h-[25px]"
        />
        <button
          className="py-1 px-2 h-[25px] rounded-md text-[20px] hover:bg-slate-200 flex jus items-center"
          onClick={() => {
            setOpenAddContact(true), setOpenContact(false)
          }}
        >
          <IoPersonAdd />
        </button>
      </div>
      <div className="w-full mt-3 flex flex-col h-[400px] overflow-y-scroll">
        {ContactPersonal
          ? ContactPersonal.map((el) => {
              return (
                <div key={el.id}>
                  <div
                    className={`h-[60px] w-full flex p-2 rounded-lg hover:bg-slate-100`}
                    key={el.id}
                    onClick={() => {
                      navigate(`/${el.Teman.phoneNumber}`)
                      setOpenContact(false)
                    }}
                  >
                    <div className="w-[20%] flex justify-center items-center">
                      <img
                        src="https://image.gambarpng.id/pngs/gambar-transparent-boy-cartoon-illustration_46930.png"
                        alt="profile"
                        className="w-[45px] h-[45px] rounded-full"
                      />
                    </div>
                    <div className="w-[80%] px-2 ">
                      <div className=" w-full flex justify-between ">
                        <div>
                          <p className="text-[15px] font-semibold">
                            {el.username}
                          </p>
                        </div>
                        <div>
                          <p className="text-[12px] font-poppins text-slate-600 ">
                            {el.jam}
                          </p>
                        </div>
                      </div>
                      <div className=" w-full flex items-center gap-1 text-slate-600 ">
                        <div>
                          <p className="text-[13px] ">
                            {potongString(el.Teman.about, 35)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          : null}
      </div>
    </div>
  )

  useEffect(() => {
    dispatch(getAllContactPersonal())
  }, [])

  return (
    <div className=" flex w-full h-full dark:bg-bgDark">
      {/* Kiri */}
      <div className="w-[15%] h-full flex flex-col justify-between bg-slate-100 dark:bg-slate-800">
        <div className="w-full h-[70px] flex justify-center items-center my-4">
          <div className="w-[45px] h-[45px] bg-white rounded-md">
            <img src={Logo} alt="Logo" />
          </div>
        </div>
        <div
          className={`w-full h-full flex flex-col justify-start items-center gap-2`}
        >
          {dataMenu?.map((el) => {
            const isSelected = el.id === selectedMenuId
            return (
              <div
                key={el.id}
                className={`w-[40px] h-[40px] rounded-md flex justify-center items-center text-[20px] hover:bg-sky-800 hover:text-white dark:text-white  ${
                  isSelected ? 'bg-sky-700 text-white' : ''
                }`}
                onClick={() => handleItemMenu(el.id, el.nama)}
              >
                {el.logo}
              </div>
            )
          })}
        </div>
        <div className="w-full h-[120px] flex flex-col gap-2 items-center py-4 ">
          <div
            className="w-[40px] h-[40px] rounded-md flex justify-center items-center text-[20px] hover:bg-sky-800 hover:text-white dark:text-white"
            onClick={() => handleDarkMode()}
          >
            {isDark ? <MdOutlineDarkMode /> : <MdDarkMode />}{' '}
          </div>
          <div className="w-[40px] h-[40px] rounded-md flex justify-center items-center text-[20px] hover:bg-sky-800 hover:text-white dark:text-white ">
            <img
              src="https://image.gambarpng.id/pngs/gambar-transparent-boy-cartoon-illustration_46930.png"
              alt="profile"
              className="w-[30px] h-[30px] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Kanan */}
      {menu == 'Chat' ? (
        <div className="w-[85%] h-full px-3 dark:bg-bgDark">
          <div className=" w-full h-[17%]">
            <div className="w-full h-[50px]  p-1 flex justify-between items-center ">
              <div className="w-[80%] ">
                <p className="text-xl font-semibold dark:text-white">Chats</p>
              </div>
              <div className="w-[20%] flex  text-xl font-light dark:text-white">
                <div className="w-1/2 flex justify-center items-center ">
                  <Popover
                    content={contentContact}
                    title="New Chat"
                    trigger="click"
                    placement="bottomLeft"
                    open={openContact}
                    onOpenChange={handleOpenChange}
                  >
                    <button>
                      <FiEdit />
                    </button>
                  </Popover>
                </div>

                <div className="w-1/2 flex justify-center items-center">
                  <Popover placement="bottomLeft" content={contentTitikChat}>
                    <HiEllipsisVertical className="text-[25px]" />
                  </Popover>
                </div>
              </div>
            </div>
            <div className={`relative w-[95%] mx-auto`}>
              <input
                type="text"
                placeholder="Search or start a new chat"
                className={`w-full py-1 pl-8 pr-4 rounded-md focus:outline-none ${
                  isDark
                    ? 'bg-bgDark text-white'
                    : 'bg-white dark:bg-bgDark text-black dark:text-white'
                } border-[1px] border-slate-200`}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <SearchOutlined
                  className={`h-5 w-5 ${isDark ? 'text-white' : 'text-black'}`}
                />
              </span>
            </div>
          </div>
          <div className="w-full h-[83%] overflow-y-scroll  ">
            <div className="flex flex-col gap-1">
              {data?.map((el) => {
                const isSelected = el.id === selectedItemId

                return (
                  <div
                    className={`h-[60px] w-full flex py-2 px-3 rounded-lg ${
                      isSelected ? 'bg-sky-700 text-white' : ''
                    } hover:bg-sky-600 hover:text-white`}
                    key={el.id}
                    onClick={() => handleItemChat(el.id)}
                  >
                    <div className="w-[15%] flex justify-center items-center">
                      <img
                        src="https://image.gambarpng.id/pngs/gambar-transparent-boy-cartoon-illustration_46930.png"
                        alt="profile"
                        className="w-[45px] h-[45px] rounded-full"
                      />
                    </div>
                    <div className="w-[85%] px-2 dark:text-white">
                      <div className=" w-full flex justify-between ">
                        <div>
                          <p className="text-[15px] font-semibold">{el.nama}</p>
                        </div>
                        <div>
                          <p className={`text-[12px] font-poppins`}>{el.jam}</p>
                        </div>
                      </div>
                      <div className={`w-full flex items-center gap-1`}>
                        <div>
                          <p className="text-[13px] ">
                            <PiChecksBold />
                          </p>
                        </div>
                        <div>
                          <p className="text-[13px] ">
                            {potongString(el.last, 25)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Add Contact */}
      <Modal
        title="Tambah Kontak"
        visible={openAddContact}
        onCancel={() => setOpenAddContact(false)}
        onOk={handleAddContact}
        width={400}
      >
        <Input
          placeholder="Username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Phone Number"
          autoComplete="off"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ marginTop: '10px' }}
        />
      </Modal>
    </div>
  )
}

export default Sidabar
