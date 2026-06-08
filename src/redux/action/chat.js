import { api } from '../../config/api'

export function getAllChatPersonal(ReceiverId) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/personal/${ReceiverId}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllChatPersonal',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getOneChat(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/${id}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneChat',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function createChat(body) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat`,
        method: 'POST',
        data: body,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function updateChat(id, data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/${id}`,
        method: 'PATCH',
        data,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function updateStatusChat(SenderId, status) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/status/${SenderId}`,
        method: 'PATCH',
        data: {
          status,
        },
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteChat(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/${id}`,
        method: 'DELETE',
      })

      return data
    } catch (error) {
      return error
    }
  }
}
