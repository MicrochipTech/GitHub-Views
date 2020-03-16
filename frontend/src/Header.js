import React from "react";
import { AuthContext } from "./Auth";
import { Grid } from "@material-ui/core";

function Header() {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <Grid
      item
      container
      justify="space-between"
      xs={12}
      className="headerWrapper"
    >
      <h1>GitHub Views</h1>
      <div className="userDetails">
        Logged in as <b>{user.username}</b>
        <br />
        <a href="#" onClick={logout}>
          Logout
        </a>
      </div>
    </Grid>
  );
}

export default Header;
