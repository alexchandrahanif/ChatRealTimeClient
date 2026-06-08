import { api } from '../../config/api'

export function getAllGroupPersonal() {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/personal`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetAllGroupPersonal',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function getOneGroup(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/${id}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneGroup',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function createGroup(data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group`,
        method: 'POST',
        data,
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })

      dispatch(getAllGroupPersonal())
      return data
    } catch (error) {
      return error
    }
  }
}

export function updateGroup(id, data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/${id}`,
        method: 'PATCH',
        data,
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })

      dispatch(getAllGroupPersonal())
      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteGroup(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/${id}`,
        method: 'DELETE',
      })

      dispatch(getAllGroupPersonal())
      return data
    } catch (error) {
      return error
    }
  }
}

//! Member

export function getOneMember(id) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/member/${id}`,
        method: 'GET',
      })

      dispatch({
        type: 'Fetch/GetOneMember',
        payload: data.data,
      })
    } catch (error) {
      return error
    }
  }
}

export function createMember(data) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/member`,
        method: 'POST',
        data,
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function updateStatusMember(GroupId, MemberId, status) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/member/${GroupId}/${MemberId}`,
        method: 'PATCH',
        data: { status },
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function deleteMember(GroupId, MemberId) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/member/${GroupId}/${MemberId}`,
        method: 'DELETE',
      })

      return data
    } catch (error) {
      return error
    }
  }
}

export function memberLeaveGroup(GroupId, MemberId) {
  return async (dispatch) => {
    try {
      const { data } = await api({
        url: `/group/member/leave/${GroupId}`,
        method: 'DELETE',
      })

      return data
    } catch (error) {
      return error
    }
  }
}
