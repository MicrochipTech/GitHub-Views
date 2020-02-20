import React from "react";
import _ from "lodash";
import { DataContext } from "./Data";
import { Grid } from "@material-ui/core";
import Chart from "chart.js";
import "./LineWithLine";
import "./LineChart.css";

import DeleteIcon from "@material-ui/icons/Delete";
import ShareButton from "./ShareButton";
import ChoseReposButton from "./ChoseReposButton";

function LineChart({ aggregateId, data, type }) {
  const chartRef = React.useRef();
  const { repos, updateAggregateChart, deleteAggregateChart } = React.useContext(DataContext);
  const[chart, setChart] = React.useState();
  const labels = data.timestamp;

  React.useEffect(
    _ => {
      setChart(new Chart(chartRef.current, {
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
      }));
    },
    []
  );

  React.useEffect(() => {
    if(chart) {
    chart.data =  {
      labels,
      datasets: data.data.map(d => ({
        label: d.label,
        fill: false,
        backgroundColor: d.color,
        borderColor: d.color,
        data: d.dataset
      }))
    };
    chart.update();
    setChart(chart);}
  }, [data, labels]);

  return (
    <Grid container className="chartWrapper">
      <Grid container justify="space-between">
        <h1>{data.chartname}</h1>
        {type === "aggregateCharts" ? (
          <div style={{ display: "flex" }}>
            <ChoseReposButton
              chartToEdit = {aggregateId}
              allRepos={[...repos["userRepos"], ...repos["sharedRepos"]]}
              selectedRepos={data.data.map(r => r._id)}
              onChange={(id, state) => {
                updateAggregateChart(aggregateId, id, state);
              }}
              onClose={(repo_list) => {

                const dataJSON = {
                  chartId: aggregateId,
                  repoList: _.uniq(repo_list)
                };
                fetch("/api/aggCharts/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(dataJSON)
                });
              }}
            />
            &nbsp;
            <div className="icon" 
                  onClick={()=> {
                    deleteAggregateChart(aggregateId);

                    const dataJSON = {
                      chartId: aggregateId
                    };

                    fetch("/api/aggCharts/delete", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(dataJSON)
                    });
            }}>
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

export default React.memo(LineChart);
