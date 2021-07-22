import React from "react";
import moment from "moment";
import { Grid } from "@material-ui/core";
import LineChart from "../Chart/LineChart";
import CardsList from "./CardsList";

function ViewsTab({ repo }) {
  const viewsPlotData = {
    timestamp: repo.views.data.map((h) =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: [repo].reduce((acc, e) => {
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

  return (
    <Grid item xs={12}>
      <CardsList
        data={[
          { title: "Total Views", text: repo.views.total_count },
          { title: "Total Unique Views", text: repo.views.total_uniques },
        ]}
      />
      <LineChart data={viewsPlotData} />
    </Grid>
  );
}

export default ViewsTab;
