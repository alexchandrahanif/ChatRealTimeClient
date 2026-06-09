let initialState = {
  Users: [],
  User: {},
  Profile: {},
}

export function UserReducer(state = initialState, actions) {
  switch (actions.type) {
    case 'Fetch/GetAllUsers':
      return {
        ...state,
        Users: actions.payload,
      }
    case 'Fetch/GetOneUser':
      return {
        ...state,
        User: actions.payload,
      }
    case 'Fetch/GetProfile':
      return {
        ...state,
        Profile: actions.payload,
      }
    case 'Presence/UpdateUserStatus':
      return {
        ...state,
        User: state.User?.id === actions.payload.userId
          ? {
              ...state.User,
              statusActive: actions.payload.status,
              lastLogin: actions.payload.lastLogin ?? state.User.lastLogin,
            }
          : state.User,
      }

    default:
      return state
  }
}
