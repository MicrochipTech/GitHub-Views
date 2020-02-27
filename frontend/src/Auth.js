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
  produce(state, draft => {
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
        throw Error("Dispatch unknown auth action");
    }
  });

function AuthProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(
    _ => {
      const checkAuth = async _ => {
        const me = await axios
          .get("/api/auth/me", { withCredentials: true })
          .catch(e => {
            dispatch({
              type: "LOGIN_FAIL",
              payload: { error: "not authenticated" }
            });
          });
        if (me != null) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: me.data }
          });
        }
      };
      checkAuth();
    },
    [dispatch]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: (username, password) => {
          fetch("/api/auth/local/login", {
            method: "post",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username,
              password
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.info) {
                alert(data.info.message);
              } else {
                // location.reload();
              }
            });
        },
        register: (username, password) => {
          if (username === "" || password === "") {
            alert("Complete both username and password");
            return;
          }
          fetch("/api/auth/local/register", {
            method: "post",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username,
              password
            })
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert("Account created! You can login.");
              } else {
                alert("This username is already taken.");
              }
            });
        },
        logout: _ => {
          window.location.replace("/api/auth/logout");
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
