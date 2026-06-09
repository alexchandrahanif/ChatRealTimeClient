import { api } from '../../config/api'

export function getConversations() {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/chat/conversations`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetConversations',
        payload: data.data,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

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
        headers:
          body instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : undefined,
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
      const response = await api({
        url: `/chat/${id}`,
        method: 'PATCH',
        data,
      })

      return response.data
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
