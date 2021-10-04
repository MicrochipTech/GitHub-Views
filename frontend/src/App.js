import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./Auth";
import { DataProvider } from "./Data";
import LinearProgress from "@material-ui/core/LinearProgress";
import Dashboard from "./DashboardPage/Dashboard";
import Login from "./LoginPage/Login";
import SingleRepo from "./SingleRepoPage/SingleRepo";
import FeedbackBtn from "./common/FeedbackButton";
import * as Sentry from "@sentry/react";

import "./App.css";

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
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
      <FeedbackBtn />
      <Switch>
        {user && user.githubId ? (
          <Redirect exact from="/" to="/dashboard/userRepos" />
        ) : (
          <Redirect exact from="/" to="/dashboard/mchpRepos" />
        )}

        <PrivateRoute
          path="/dashboard/:section"
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
    <Sentry.ErrorBoundary fallback={"An error has occurred"} showDialog>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
