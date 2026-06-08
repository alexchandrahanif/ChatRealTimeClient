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

    default:
      return state
  }
}
