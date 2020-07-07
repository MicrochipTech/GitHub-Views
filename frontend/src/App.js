import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./Auth";
import { DataProvider } from "./Data";
import LinearProgress from "@material-ui/core/LinearProgress";
import Dashboard from "./Dashboard";
import Login from "./Login";
import SingleRepo from "./SingleRepo";

import "./App.css";

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

function AppRouter() {
  const { authenticated, resolving } = React.useContext(AuthContext);
  const { user } = React.useContext(AuthContext);
  if (resolving) {
    return <LinearProgress />;
  }
  return (
    <Router>
      <Switch>
        {user && user.githubId ? (
          <Redirect exact from="/" to="/dashboard/userRepos" />
        ) : (
          <Redirect exact from="/" to="/dashboard/sharedRepos" />
        )}

        <PrivateRoute
          path="/dashboard/:page"
          component={Dashboard}
          authenticated={authenticated}
        />

        <PrivateRoute
          path="/repo/:repoId"
          component={SingleRepo}
          authenticated={authenticated}
        />

        <Route
          exact
          path="/login"
          component={() => <Login authenticated={authenticated} />}
        />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRouter />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
