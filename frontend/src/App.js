import React from "react";

import { AuthContext, AuthProvider } from "./Auth";
import LinearProgress from "@material-ui/core/LinearProgress";
import Dashboard from "./Dashboard";
import Login from "./Login";

import "./App.css";

function Router() {
  const { authenticated, resolving } = React.useContext(AuthContext);
  if (resolving) {
    return <LinearProgress />;
  }
  return <div>{authenticated ? <Dashboard /> : <Login />}</div>;
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
