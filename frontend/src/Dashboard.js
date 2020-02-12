import React from "react";
import axios from "axios";
import { AuthContext } from "./Auth";
import { Grid } from "@material-ui/core";
import LineChart from "./LineChart";
import CircularProgress from "@material-ui/core/CircularProgress";

import "./Dashboard.css";

const PAGES = [
  { title: "My Repositories", key: "userRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" }
];

function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);

  const [loadingData, setLoadingData] = React.useState(true);
  const [page, setPage] = React.useState(user.githubId ? PAGES[0] : PAGES[1]);
  const [data, setData] = React.useState({
    userRepos: [],
    sharedRepos: [],
    aggregateCharts: []
  });

  React.useEffect(
    _ => {
      const getData = async _ => {
        const res = await axios.get("/api/user/getData").catch(e => {});
        if (res != null) {
          setData(res.data);
        }
        setLoadingData(false);
      };
      getData();
    },
    [setData]
  );

  return (
    <Grid container className="dashboardWrapper">
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

      <Grid item md={2}>
        <nav>
          <ul>
            {PAGES.filter((p, idx) => {
              if (idx === 0) {
                return user.githubId != null;
              }
              return true;
            }).map(p => (
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
            <LineChart key={d._id} data={d} />
          ))}
          {loadingData && (
            <center className="padding20">
              <CircularProgress />
            </center>
          )}
          {!loadingData && data[page.key].length === 0 && (
            <div className="nothing">Nothig to show here...</div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
