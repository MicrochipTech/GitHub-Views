import React from "react";
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { DataContext } from "../Data";
import ChoseReposModal from "./ChoseReposModal";

function NewAggregateChartButton({ text }) {
  const { repos, addAggregateChart } = React.useContext(DataContext);
  const [newChartRepos, setNewChartRepos] = React.useState([]);
  return (
    <ChoseReposModal
      icon={
        <Button>
          <AddIcon />
          {text}
        </Button>
      }
      allRepos={[...repos["userRepos"], ...repos["sharedRepos"]]}
      onChange={(id, state) => {
        const aux = [...newChartRepos];
        if (state) {
          aux.push(id);
        } else {
          const idx = aux.indexOf(id);
          aux.splice(idx, 1);
        }
        setNewChartRepos(aux);
      }}
      onDone={async () => {
        const dataJSON = {
          repo_list: newChartRepos,
        };
        setNewChartRepos([]);
        const res = await fetch("/api/aggCharts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataJSON),
        });

        const body = await res.json();
        addAggregateChart(body.aggChart);
      }}
      selectedRepos={newChartRepos}
    />
  );
}

export default NewAggregateChartButton;
