import { api } from '../../config/api'

export function getAllGroupChatPersonal(GroupId) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/groupChat/personal/${GroupId}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllGroupChatPersonal',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getOneGroupChat(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/groupChat/${id}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneGroupChat',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function createGroupChat(data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/groupChat`,
        method: 'POST',
        data,
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })

      dispatch(getAllGroupChatPersonal(data.GroupId))
      return data
    } catch (error) {
      return error
    }
  }
}

export function updateGroupChat(id, data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/groupChat/${id}`,
        method: 'PATCH',
        data,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteGroupChat(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/groupChat/${id}`,
        method: 'DELETE',
      })

      return data
    } catch (error) {
      return error
    }
  }
}
