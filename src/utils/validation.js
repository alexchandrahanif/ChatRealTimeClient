export const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

export const normalizePhoneNumber = (phoneNumber) => {
  const cleaned = String(phoneNumber || '').replace(/\D/g, '')

  if (cleaned.startsWith('62')) {
    return `0${cleaned.slice(2)}`
  }

  return cleaned
}

export const validatePhoneNumber = (phoneNumber) => /^0\d{9,14}$/.test(normalizePhoneNumber(phoneNumber))

export const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
