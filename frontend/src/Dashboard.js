import React from "react";
import moment from "moment";
import { AuthContext } from "./Auth";
import { DataContext } from "./Data";
import { Grid } from "@material-ui/core";
import DownloadButton from "./DownloadButton";
import LineChart from "./LineChart";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import NewAggregateChartButton from "./NewAggregateChartButton";
import "./Dashboard.css";

function generateRandomColour(total, idx) {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;
}

const PAGES = [
  { title: "My Repositories", key: "userRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" }
];

function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const { repos, loadingData, syncRepos } = React.useContext(DataContext);
  const [page, setPage] = React.useState(user.githubId ? PAGES[0] : PAGES[1]);
  const [searchRegex, setSearchRegex] = React.useState(new RegExp(`.*`, "i"));

  const visibleRepos = repos[page.key].filter(
    d => !d.reponame || d.reponame.match(searchRegex)
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
              <li key={p.key} 
                onClick={_ => setPage(p)}>
                {p.title}
              </li>
            ))}
            <hr />
            <DownloadButton />
            {user.githubId && <li onClick={syncRepos}>Sync Repositories</li>}
          </ul>
        </nav>
      </Grid>

      <Grid item md={10}>
        {!loadingData && page.key !== "aggregateCharts" && (
          <TextField
            fullWidth
            style={{ marginTop: "20px", marginBottom: "10px" }}
            onChange={e => {
              setSearchRegex(new RegExp(`${e.target.value.trim()}`, "i"));
            }}
            id="outlined-size-small"
            label="Search Repositories"
            variant="outlined"
            size="small"
          />
        )}
        <div>
          {!loadingData &&
            visibleRepos.length !== 0 &&
            visibleRepos.map(d => {
              let dataD = [];
              let labels = [];
              let plotData = null;
              if (page.key === "aggregateCharts") {
                dataD = d.repo_list.map(
                  r =>
                    repos["userRepos"]
                      .concat(repos["sharedRepos"])
                      .filter(m => m._id === r)[0]
                );

                const maximumTimetamp = new Date();
                maximumTimetamp.setUTCHours(0, 0, 0, 0);
                maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

                let minimumTimetamp = new Date();
                minimumTimetamp.setUTCHours(0, 0, 0, 0);
                minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

                minimumTimetamp = dataD.reduce((acc, repo) => {
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
                  data: dataD.reduce((acc, e, idx) => {
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

                    acc.push({
                      label: `${repo.reponame} - Views`,
                      dataset: views,
                      color: generateRandomColour(),
                      _id: e._id
                    });
                    acc.push({
                      label: `${repo.reponame} - Unique Views`,
                      dataset: uniques,
                      _id: e._id,
                      color: generateRandomColour()
                    });
                    return acc;
                  }, [])
                };
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
                    acc.push({
                      label: `Views`,
                      dataset: views,
                      color: "#603A8B"
                    });
                    acc.push({
                      label: `Unique Views`,
                      dataset: uniques,
                      color: "#FDCB00"
                    });
                    return acc;
                  }, [])
                };
              }

              return (
                <LineChart
                  key={d._id}
                  aggregateId={d._id}
                  data={plotData}
                  type={page.key}
                />
              );
            })}
          {loadingData && (
            <center className="padding20">
              <CircularProgress />
            </center>
          )}
          {!loadingData &&
            (repos[page.key].length === 0 || visibleRepos.length === 0) && (
              <div>
                <br />
                <div className="nothing">
                  Nothing to show here.
                  {page.key === "aggregateCharts" && (
                    <div>
                      <NewAggregateChartButton text="Create First Aggregate Chart" />
                    </div>
                  )}
                </div>
              </div>
            )}

          {!loadingData &&
            page.key === "aggregateCharts" &&
            repos[page.key].length > 0 && (
              <center>
                <NewAggregateChartButton text="Create New Aggregate Chart" />
              </center>
            )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
