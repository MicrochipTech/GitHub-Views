import React from "react";
import { Grid } from "@material-ui/core";
import moment from "moment";
import Chart from "chart.js";
import ShareButton from "./ShareButton";
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

function generateRandomColour() {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;
}

function LineChart({ data }) {
  const chartRef = React.useRef();

  // const repo = prepareRepo(data);
  // const labels = repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY"));
  // const views = repo.views.map(h => h.count);
  // const uniques = repo.views.map(h => h.uniques);

  const labels = data.timestamp;
  

  React.useEffect(
    _ => {
      new Chart(chartRef.current, {
        /* The type of chart we want to create */
        type: "LineWithLine",

        /* The data for our dataset */
        data: {
          labels,
          datasets: data.data.map (d => {
            return {
              label: d.label,
              fill: false,
              backgroundColor: generateRandomColour(),
              borderColor: generateRandomColour(),
              data: d.dataset
            }
          })
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
    [data]
  );

  return (
    <Grid container className="chartWrapper">
      <Grid container justify="space-between">
        <h1>{data.chartname}</h1>
        <ShareButton repoId={data._id} />
      </Grid>
      <canvas ref={chartRef} />
    </Grid>
  );
}

export default LineChart;
