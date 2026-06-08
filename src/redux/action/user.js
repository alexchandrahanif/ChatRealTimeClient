import { api } from '../../config/api'

export function getAllUsers() {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllUsers',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getOneUser(phoneNumber) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user/${phoneNumber}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneUser',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function updateUser(id, data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user/${id}`,
        method: 'PATCH',
        data: data,
      })

      dispatch(getAllUsers())

      return data
    } catch (error) {
      return error
    }
  }
}

export function verifyCode(id, code) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user/verify/${id}`,
        method: 'POST',
        data: {
          code,
        },
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function updateStatusUser(id, status) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user/status/${id}`,
        method: 'PATCH',
        data: {
          status,
        },
      })

      dispatch(getAllUsers())

      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteUser(id, status) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/user/${id}`,
        method: 'DELETE',
      })

      dispatch(getAllUsers())

      return data
    } catch (error) {
      return error
    }
  }
}
