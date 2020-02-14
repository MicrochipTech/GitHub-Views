import React from "react";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "./Auth";
import { Grid, Button } from "@material-ui/core";
import LineChart from "./LineChart";
import CircularProgress from "@material-ui/core/CircularProgress";

import "./Dashboard.css";

function prepareRepo(repo) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);
  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);

  if (repo.views.length !== 0) {
    const first = new Date(repo.views[0].timestamp);
    const last = new Date(repo.views[repo.views.length - 1].timestamp);

    if (first.getTime() < firstTimestamp.getTime()) {
      firstTimestamp = first;
    }

    if (last.getTime() > lastTimestamp.getTime()) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  const timeIndex = firstTimestamp;

  while (timeIndex.getTime() <= lastTimestamp.getTime()) {
    if (repo.views[index] === undefined) {
      repo.views.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0
      });
    } else {
      const currentTimestamp = new Date(repo.views[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        repo.views.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return repo;
}

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

  console.log(data);

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
          {data[page.key].map(d => {
            let data = [];

            if (page.key === "aggregateCharts") {
              data = d.repo_list.map(r =>
                [...d.userRepos, ...d.shareRepos].filter(m => r._id === r)
              );
              // TODO: align start date for repo
            } else {
              data.push(d);
              const labels = d.views.map(h =>
                moment(h.timestamp).format("DD MMM YYYY")
              );
            }

            data.reduce((acc, e) => {
              const repo = prepareRepo(data);
              const views = repo.views.map(h => h.count);
              const uniques = repo.views.map(h => h.uniques);
              acc.push({ label: `views`, dataset: views });
              acc.push({ lable: `unique`, dataset: uniques });
              return acc;
            }, []);

            console.log(data);
            return <p>dummy</p>;
            // TODO: change lineChart to receive array like data
            // return <LineChart key={d._id} data={data} />;
          })}
          {loadingData && (
            <center className="padding20">
              <CircularProgress />
            </center>
          )}
          {!loadingData && data[page.key].length === 0 && (
            <div className="nothing">
              Nothig to show here...
              {page.key === "aggregateCharts" && (
                <Button>Create First Aggregate Chart</Button>
              )}
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
