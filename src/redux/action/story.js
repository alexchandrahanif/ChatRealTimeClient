import { api } from '../../config/api'

export function getStories() {
  return async (dispatch) => {
    try {
      const { data } = await api({ url: '/story', method: 'GET' })
      dispatch({ type: 'Fetch/GetStories', payload: data.data })
      return data
    } catch (error) {
      return error
    }
  }
}

export function createStory(body) {
  return async () => {
    try {
      const { data } = await api({
        url: '/story',
        method: 'POST',
        data: body,
        headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return error
    }
  }
}

export function viewStory(id) {
  return async () => {
    try {
      const { data } = await api({ url: `/story/${id}/view`, method: 'PATCH' })
      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteStory(id) {
  return async () => {
    try {
      const { data } = await api({ url: `/story/${id}`, method: 'DELETE' })
      return data
    } catch (error) {
      return error
    }
  }
}
