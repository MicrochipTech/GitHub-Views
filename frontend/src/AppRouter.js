import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import { AuthContext } from "./Auth";
import Dashboard from "./DashboardPage/Dashboard";
import Login from "./LoginPage/Login";
import SingleRepo from "./SingleRepoPage/SingleRepo";
import FeedbackBtn from "./common/FeedbackButton";

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
  const { authenticated, resolving, user } = React.useContext(AuthContext);
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

export default AppRouter;
