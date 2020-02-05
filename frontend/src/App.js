import React from "react";

import { AuthContext, AuthProvider } from "./Auth";
import Dashboard from "./Dashboard";
import Login from "./Login";

import "./App.css";

function App() {
  React.useContext(AuthContext);
  const authenticated = true;
  return (
    <AuthProvider>
      <div>{authenticated ? <Dashboard /> : <Login />}</div>
    </AuthProvider>
  );
}

export default App;
