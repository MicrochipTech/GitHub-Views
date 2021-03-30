import React from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../Auth";
import { Grid, Button, TextField } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import { VERSION } from "../VERSION";

import "./Login.css";

function Login({ authenticated }) {
  const history = useHistory();
  const { login, register } = React.useContext(AuthContext);
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const [backedVersion, setBackendVersion] = React.useState("");

  React.useEffect(() => {
    async function getBackedVersion() {
      const v = await axios.get("/api/VERSION");
      setBackendVersion(v.data);
    }
    getBackedVersion();
  }, []);

  const styles = {
    smallIcon: {
      width: 60,
      height: 60,
    },
    small: {
      marginTop: "50px",
      width: 120,
      height: 120,
      padding: 16,
    },
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
          variant="outlined"
          onClick={(_) => window.location.replace("/api/auth/github")}
        >
          Click Here to Login With GitHub
        </Button>
        <br />
        <br />
        <p>
          This tool will automatically collect views data for all the
          repositories you have access to.
        </p>
        <hr />
        <p>
          Login with username and password and you will still be able to view
          repos from <b>"microchip-pic-avr-examples</b>,{" "}
          <b>"microchip-pic-avr-solutions</b> and <b>MicrochipTech</b> <br />
          organizations, plus what other repos other users share with you.
        </p>
        <div className="localLoginWrapper">
          <div>
            <TextField
              label="Username"
              variant="outlined"
              style={{ width: "100%" }}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => {
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
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  login(username, password);
                }
              }}
            />
          </div>
          <div align="center" style={{ background: "transparent" }}>
            <Button
              color="primary"
              onClick={(_) => login(username, password)}
              disabled={username === "" || password === ""}
            >
              Login
            </Button>
            <Button
              color="primary"
              onClick={(_) => register(username, password)}
              disabled={username === "" || password === ""}
            >
              Register
            </Button>
          </div>
        </div>
        <small>
          Frontend version:{VERSION}
          <br />
          Backend version: {backedVersion}
        </small>
      </center>
    </Grid>
  );
}

export default Login;
