import { api } from '../../config/api'

export function getAllContactPersonal() {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact/personal`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllContactPersonal',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getAllContact() {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllContact',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getOneContact(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact/${id}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneContact',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function createContact(body) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact`,
        method: 'POST',
        data: body,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function updateContact(id, data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact/${id}`,
        method: 'PATCH',
        data,
      })

      dispatch(getAllContactPersonal())
      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteContact(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/contact${id}`,
        method: 'DELETE',
      })

      dispatch(getAllContactPersonal())
      return data
    } catch (error) {
      return error
    }
  }
}
