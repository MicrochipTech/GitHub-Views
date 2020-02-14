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
          //console.log(res.data);
          res.data.userRepos = res.data.userRepos.map(r => prepareRepo(r));
          res.data.sharedRepos = res.data.sharedRepos.map(r => prepareRepo(r));
          //console.log(res.data);
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
          {data[page.key].map(d => {
            let dataD = [];
            let labels = [];
            let plotData = null;

            if (page.key === "aggregateCharts") {
              dataD = d.repo_list.map(r =>
                data["userRepos"].concat(data["sharedRepos"]).filter(m => m._id === r)[0]
              );
              
              const maximumTimetamp = new Date();
              maximumTimetamp.setUTCHours(0, 0, 0, 0);
              maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

              let minimumTimetamp = new Date();
              minimumTimetamp.setUTCHours(0, 0, 0, 0);
              minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

              minimumTimetamp = dataD.reduce((acc, repo)=> {
                const repoDate = new Date(repo.views[0].timestamp);

                if (repoDate < acc) {
                  acc = repoDate;
                }
                return acc;
              }, minimumTimetamp);

              let timeIndex = new Date(minimumTimetamp.getTime());

              while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
                labels.push(moment(timeIndex).format("DD MMM YYYY"));
              
                timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
              }

              plotData = {
                chartname: "chart",
                timestamp: labels,
                data: dataD.reduce((acc, e) => {
                  const repo = e;
                  let views = [];
                  let uniques = [];

                  const limitTimestamp = new Date(repo.views[0].timestamp);
                  timeIndex = new Date(minimumTimetamp.getTime());

                  while (timeIndex.getTime() < limitTimestamp.getTime()) {
                    views.push(0);
                    uniques.push(0);

                    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
                  }

                  views = views.concat(repo.views.map(h => h.count));
                  uniques = uniques.concat(repo.views.map(h => h.uniques));

                  acc.push({ label: `${repo.reponame} - views`, dataset: views });
                  acc.push({ label: `${repo.reponame} - unique`, dataset: uniques });
                  return acc;
                }, [])
              }
            } else {
              dataD.push(d);

              plotData = {
                chartname: d.reponame,
                timestamp: d.views.map(h =>
                  moment(h.timestamp).format("DD MMM YYYY")
                ),
                data: dataD.reduce((acc, e) => {
                  const repo = e;
                  const views = repo.views.map(h => h.count);
                  const uniques = repo.views.map(h => h.uniques);
                  acc.push({ label: `views`, dataset: views });
                  acc.push({ label: `unique`, dataset: uniques });
                  return acc;
                }, [])
              }

            }

            return <LineChart key={d._id} data={plotData} />;
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
