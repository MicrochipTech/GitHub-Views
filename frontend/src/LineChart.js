import React from "react";
import { Grid, Button, TextField } from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import { Line } from "react-chartjs-2";
import moment from "moment";
import ModalButton from "./ModalButton";
import Chart from "chart.js";
import "./LineWithLine";
import "./LineChart.css";

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

function LineChart({ data }) {
  console.log(data);
  const chartRef = React.useRef();

  const repo = prepareRepo(data);
  const labels = repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));
  const views = repo.views.map(h => h.count);
  const uniques = repo.views.map(h => h.uniques);

  React.useEffect(
    _ => {
      new Chart(chartRef.current, {
        /* The type of chart we want to create */
        type: "LineWithLine",

        /* The data for our dataset */
        data: {
          labels,
          datasets: [
            {
              label: "Views",
              fill: false,
              backgroundColor: "#603A8B",
              borderColor: "#603A8B",
              data: views
            },
            {
              label: "Unique Views",
              fill: false,
              backgroundColor: "#FDCB00",
              borderColor: "#FDCB00",
              data: uniques
            }
          ]
        },

        /* Configuration options go here */
        options: {
          tooltips: {
            intersect: false,
            mode: "label",
            position: "nearPointer"
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 8
                }
              }
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          },
          elements: {
            line: {
              tension: 0
            }
          }
        }
      });
    },
    [chartRef, labels, uniques, views]
  );

  return (
    <Grid container className="chartWrapper">
      <Grid container justify="space-between">
        <h1>{data.reponame}</h1>
        <ModalButton
          button={
            <div className="icon">
              <ShareIcon />
            </div>
          }
        >
          <div className="padding20">
            <h2 id="transition-modal-title">Share this repository with:</h2>
          </div>
          <hr />
          <div className="padding20">
            <TextField fullWidth label="Username" variant="outlined" />
          </div>
          <hr />
          <div className="padding20">
            <Button>Close</Button>
            <Button>Share</Button>
          </div>
        </ModalButton>
      </Grid>
      <canvas ref={chartRef} />
    </Grid>
  );
}

export default LineChart;
