const initialState = {
  Stories: [],
}

export function StoryReducer(state = initialState, actions) {
  switch (actions.type) {
    case 'Fetch/GetStories':
      return {
        ...state,
        Stories: actions.payload,
      }
    default:
      return state
  }
}
