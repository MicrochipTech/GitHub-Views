import React from "react";
import produce from "immer";
import axios from "axios";
const AuthContext = React.createContext();

const initialState = {
  resolving: true,
  authenticated: false,
  error: null,
  user: null
};

const reducer = (state, action) =>
  produce(draft => {
    switch (action.type) {
      case "LOGIN_START":
        draft.resolving = true;
        break;
      case "LOGIN_SUCCESS":
        const { user } = action.payload;
        draft.resolving = false;
        draft.authenticated = true;
        draft.user = user;
        break;
      case "LOGIN_FAIL":
        const { error } = action.payload;
        draft.resolving = false;
        draft.authenticated = false;
        draft.error = error;
        break;
      default:
    }
  });

function AuthProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(_ => {
    const checkAuth = async _ => {
      const me = await axios.get("/api/auth/me");
      console.log(me);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: (username, password) => {},
        register: (username, password) => {},
        logout: _ => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
