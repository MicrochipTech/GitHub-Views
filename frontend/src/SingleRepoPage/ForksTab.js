import React from "react";
import moment from "moment";
import { Grid } from "@material-ui/core";
import LineChart from "../Chart/LineChart";
import { add0s } from "../utils";
import CardsList from "./CardsList";

function ForksTab({ repo }) {
  const forksRaw = add0s([...repo.forks.data]);
  const forksPlotData = {
    timestamp: forksRaw.map((h) => moment(h.timestamp).format("DD MMM YYYY")),
    data: [repo].reduce((acc, e) => {
      const repo = e;
      const forks = forksRaw.map((h) => h.count);
      acc.push({
        label: `Forks`,
        dataset: forks,
        color: "#603A8B",
      });
      return acc;
    }, []),
  };
  console.log(forksPlotData);

  const cardsData = [{ title: "Total Forks", text: repo.forks.data.length }];

  return (
    <Grid item xs={12}>
      <CardsList data={cardsData} />
      <LineChart data={forksPlotData} />
    </Grid>
  );
}

export default ForksTab;
