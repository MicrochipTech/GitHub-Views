import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import _ from "lodash";
import { Grid } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import ChoseReposModal from "./ChoseReposModal";
import { DataContext } from "../Data";
import ShareButton from "./ShareButton";
import LineChart from "../Chart/LineChart";
import axios from "axios";

function generateRandomColour(total, idx) {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;
}

function Repository({ index, data }) {
  const {
    repos,
    names,
    updateAggregateChart,
    deleteAggregateChart,
    unfollowSharedRepo,
  } = React.useContext(DataContext);
  const { page, visibleRepos } = data;
  const [d] = useState(visibleRepos[index]);
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    const calc = async () => {
      let dataD = [];
      let labels = [];
      let plotData = null;
      if (page === "aggregateCharts") {
        dataD = await Promise.all(
          d.repo_list.map(async (r) => {
            const res = await axios.get(`/api/user/getData/${r}`);
            return res.data;
          })
        );
        // Some repos can return null if the user does not have
        // access to them. This should be fixed by refactoring the
        // API to provide proper http response code and
        // also handle permissions more robus.
        // Following is just a dirty fix
        dataD = dataD.filter((r) => r !== null);

        const maximumTimetamp = new Date();
        maximumTimetamp.setUTCHours(0, 0, 0, 0);
        maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

        let minimumTimetamp = new Date();
        minimumTimetamp.setUTCHours(0, 0, 0, 0);
        minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

        minimumTimetamp = dataD.reduce((acc, repo) => {
          const repoDate = new Date(repo.views.data[0].timestamp);

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
          timestamp: labels,
          data: dataD.reduce((acc, e, idx) => {
            const repo = e;
            let views = repo.views.data.map((h) => h.count);
            let uniques = repo.views.data.map((h) => h.uniques);

            const limitTimestamp = new Date(repo.views.data[0].timestamp);

            for (
              let timeIndex = new Date(minimumTimetamp.getTime());
              timeIndex.getTime() < limitTimestamp.getTime();
              timeIndex.setUTCDate(timeIndex.getUTCDate() + 1)
            ) {
              views.unshift(0);
              uniques.unshift(0);
            }

            acc.push(
              {
                label: `${repo.reponame} - Views`,
                dataset: views,
                color: generateRandomColour(),
                _id: e._id,
              },
              {
                label: `${repo.reponame} - Unique Views`,
                dataset: uniques,
                _id: e._id,
                color: generateRandomColour(),
              }
            );
            return acc;
          }, []),
        };
      } else {
        dataD.push(d);

        plotData = {
          timestamp: d.views.data.map((h) =>
            moment(h.timestamp).format("DD MMM YYYY")
          ),
          data: dataD.reduce((acc, e) => {
            const repo = e;
            const views = repo.views.data.map((h) => h.count);
            const uniques = repo.views.data.map((h) => h.uniques);
            acc.push({
              label: `Views`,
              dataset: views,
              color: "#603A8B",
            });
            acc.push({
              label: `Unique Views`,
              dataset: uniques,
              color: "#FDCB00",
            });
            return acc;
          }, []),
        };
      }

      setPlotData(plotData);
    };
    calc();
  }, [d, page]);

  if (plotData === null) {
    return <p>Loading</p>;
  }

  return (
    <Grid container className="chartWrapper">
      <Grid container justify="space-between">
        <h1>
          <Link
            to={{
              pathname: `/repo/${d._id}`,
            }}
          >
            {d.reponame}
          </Link>
        </h1>
        {page === "aggregateCharts" && (
          <div style={{ display: "flex" }}>
            <ChoseReposModal
              allRepos={[...names, ...repos["sharedRepos"]]}
              selectedRepos={plotData.data.map((r) => r._id)}
              onChange={(id, state) => {
                updateAggregateChart(d._id, id, state);
              }}
              onClose={(repo_list) => {
                const dataJSON = {
                  chartId: d._id,
                  repoList: _.uniq(repo_list),
                };
                fetch("/api/aggCharts/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dataJSON),
                });
              }}
            />
            &nbsp;
            <div
              className="icon"
              onClick={() => {
                deleteAggregateChart(d._id);

                const dataJSON = {
                  chartId: d._id,
                };

                fetch("/api/aggCharts/delete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dataJSON),
                });
              }}
            >
              <DeleteIcon />
            </div>
          </div>
        )}
        {page === "userRepos" && (
          <div>
            <ShareButton repoId={data._id} />
          </div>
        )}
        {page === "sharedRepos" && (
          <div
            className="icon"
            onClick={() => {
              unfollowSharedRepo(d._id);
            }}
          >
            <DeleteIcon />
          </div>
        )}
      </Grid>
      <LineChart key={d._id} data={plotData} />
    </Grid>
  );
}

export default Repository;
