import React from "react";
import moment from "moment";
import { Grid } from "@material-ui/core";
import LineChart from "../Chart/LineChart";
import CardsList from "./CardsList";

function ClonesTab({ repo }) {
  const clonesPlotData = {
    timestamp: repo.clones.data.map((h) =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: [repo].reduce((acc, e) => {
      const repo = e;
      const clones = repo.clones.data.map((h) => h.count);
      const cloners = repo.clones.data.map((h) => h.uniques);
      acc.push({
        label: `Clones`,
        dataset: clones,
        color: "#603A8B",
      });
      acc.push({
        label: `Unique Cloners`,
        dataset: cloners,
        color: "#FDCB00",
      });
      return acc;
    }, []),
  };

  const cardsData = [
    { title: "Total Clones", text: repo.clones.total_count },
    { title: "Unique Cloners", text: repo.clones.total_count },
  ];

  return (
    <Grid item xs={12}>
      <CardsList data={cardsData} />
      <LineChart data={clonesPlotData} />
    </Grid>
  );
}

export default ClonesTab;
