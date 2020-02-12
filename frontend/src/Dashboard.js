import React from "react";
import axios from "axios";
import { AuthContext } from "./Auth";
import { Grid, Button, Paper } from "@material-ui/core";
import LineChart from "./LineChart";
import Autocomplete from "./Autocomplete";

import "./Dashboard.css";

const PAGES = [
  { title: "My Repositories", key: "userRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" }
];

function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const [page, setPage] = React.useState(PAGES[0]);
  const [data, setData] = React.useState({
    userRepos: [],
    sharedRepos: [],
    aggregateCharts: []
  });

  React.useEffect(
    _ => {
      const getData = async _ => {
        const res = await axios.get("/api/user/getData").catch(e => {});
        console.log(res.data);
        if (res != null) {
          setData(res.data);
        }
      };
      getData();
    },
    [setData]
  );

  return (
    <Grid container className="dashboardWrapper">
      <Autocomplete />
      <Grid container justify="space-between" xs={12} className="headerWrapper">
        <h1>GitHub Views</h1>
        <div className="userDetails">
          Logged in as <b>{user.username}</b>
          <br />
          <a href="#" onClick={logout}>
            Logout
          </a>
        </div>
      </Grid>

      <Grid item md={2}>
        <nav>
          <ul>
            {PAGES.map(p => (
              <li key={p.key} onClick={_ => setPage(p)}>
                {p.title}
              </li>
            ))}
            <hr />
            <li>Export as CSV</li>
            <li>Sync Repositories</li>
          </ul>
        </nav>
      </Grid>

      <Grid item md={10}>
        <div>
          {data[page.key].map(d => (
            <LineChart data={d} />
          ))}
          {data[page.key].length === 0 && (
            <div className="nothing">Nothig to show here...</div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
