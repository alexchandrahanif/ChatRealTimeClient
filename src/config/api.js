import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const authorization = localStorage.getItem('authorization')

  if (authorization) {
    config.headers.authorization = authorization
  }

  return config
})
