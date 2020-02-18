import React from "react";
import { DataContext } from "./Data";
import { Grid } from "@material-ui/core";
import Chart from "chart.js";
import "./LineWithLine";
import "./LineChart.css";

import DeleteIcon from "@material-ui/icons/Delete";
import ShareButton from "./ShareButton";
import ChoseReposButton from "./ChoseReposButton";

function LineChart({ data, type }) {
  const chartRef = React.useRef();
  const { repos } = React.useContext(DataContext);

  const labels = data.timestamp;

  React.useEffect(
    _ => {
      new Chart(chartRef.current, {
        /* The type of chart we want to create */
        type: "LineWithLine",

        /* The data for our dataset */
        data: {
          labels,
          datasets: data.data.map(d => ({
            label: d.label,
            fill: false,
            backgroundColor: d.color,
            borderColor: d.color,
            data: d.dataset
          }))
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
    [data, labels]
  );

  return (
    <Grid container className="chartWrapper">
      <Grid container justify="space-between">
        <h1>{data.chartname}</h1>
        {type === "aggregateCharts" ? (
          <div style={{ display: "flex" }}>
            <ChoseReposButton
              allRepos={[...repos["userRepos"], ...repos["sharedRepos"]]}
              selectedRepos={data.data.map(r => r._id)}
            />
            &nbsp;
            <div className="icon">
              <DeleteIcon />
            </div>
          </div>
        ) : (
          <div>
            <ShareButton repoId={data._id} />
          </div>
        )}
      </Grid>
      <canvas ref={chartRef} />
    </Grid>
  );
}

export default LineChart;
