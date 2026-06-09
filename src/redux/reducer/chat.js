let initialState = {
  Conversations: [],
  ChatPersonal: [],
  Chat: {},
}

export function ChatReducer(state = initialState, actions) {
  switch (actions.type) {
    case 'Fetch/GetAllChatPersonal':
      return {
        ...state,
        ChatPersonal: actions.payload,
      }
    case 'Fetch/GetConversations':
      return {
        ...state,
        Conversations: actions.payload,
      }
    case 'Fetch/GetOneChat':
      return {
        ...state,
        Chat: actions.payload,
      }
    case 'Presence/UpdateUserStatus':
      return {
        ...state,
        Conversations: state.Conversations.map((conversation) => (
          conversation.user?.id === actions.payload.userId
            ? {
                ...conversation,
                user: {
                  ...conversation.user,
                  statusActive: actions.payload.status,
                  lastLogin: actions.payload.lastLogin ?? conversation.user.lastLogin,
                },
              }
            : conversation
        )),
      }

    default:
      return state
  }
}
