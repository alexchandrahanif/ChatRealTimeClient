let initialState = {
  Contacts: [],
  ContactPersonal: [],
  Contact: {},
}

export function ContactReducer(state = initialState, actions) {
  switch (actions.type) {
    case 'Fetch/GetAllContacts':
      return {
        ...state,
        Contacts: actions.payload,
      }
    case 'Fetch/GetAllContactPersonal':
      return {
        ...state,
        ContactPersonal: actions.payload,
      }
    case 'Fetch/GetOneContact':
      return {
        ...state,
        Contact: actions.payload,
      }
    case 'Presence/UpdateUserStatus':
      return {
        ...state,
        ContactPersonal: state.ContactPersonal.map((contact) => (
          contact.Teman?.id === actions.payload.userId
            ? {
                ...contact,
                Teman: {
                  ...contact.Teman,
                  statusActive: actions.payload.status,
                  lastLogin: actions.payload.lastLogin ?? contact.Teman.lastLogin,
                },
              }
            : contact
        )),
        Contact: state.Contact?.Teman?.id === actions.payload.userId
          ? {
              ...state.Contact,
              Teman: {
                ...state.Contact.Teman,
                statusActive: actions.payload.status,
                lastLogin: actions.payload.lastLogin ?? state.Contact.Teman.lastLogin,
              },
            }
          : state.Contact,
      }

    default:
      return state
  }
}
