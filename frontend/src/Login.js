import React from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "./Auth";
import { Grid, Button, TextField } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

import "./Login.css";

function Login({ authenticated }) {
  const history = useHistory();
  const { login, register } = React.useContext(AuthContext);
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const styles = {
    smallIcon: {
      width: 60,
      height: 60
    },
    small: {
      marginTop: "50px",
      width: 120,
      height: 120,
      padding: 16
    }
  };

  if (authenticated) {
    history.push("/");
  }

  return (
    <Grid container justify="center">
      <center>
        <GitHubIcon iconStyle={styles.smallIcon} style={styles.small} />
        <br />
        <h1 className="first-page-title">GitHub Views</h1>
        <Button
          className="loginBtn"
          color="primary"
          onClick={_ => window.location.replace("/api/auth/github")}
        >
          Login With GitHub Account
        </Button>
        <br />
        <br />
        <p>
          This tool will automatically collect views data for all the
          repositories you have access to.
        </p>
        <p>It will not be shared with anyone unless you give access to.</p>
        <hr />
        <p>
          Login with username and password and you will still be able to view
          repos that other users share with you in this app
        </p>
        <div className="localLoginWrapper">
          <div>
            <TextField
              label="Username"
              variant="outlined"
              style={{ width: "100%" }}
              onChange={e => setUsername(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  login(username, password);
                }
              }}
            />
          </div>
          <br />
          <div>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              style={{ width: "100%" }}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  login(username, password);
                }
              }}
            />
          </div>
          <div align="center" style={{ background: "transparent" }}>
            <Button
              color="primary"
              onClick={_ => login(username, password)}
              disabled={username === "" || password === ""}
            >
              Login
            </Button>
            <Button
              color="primary"
              onClick={_ => register(username, password)}
              disabled={username === "" || password === ""}
            >
              Register
            </Button>
          </div>
        </div>
      </center>
    </Grid>
  );
}

export default Login;
