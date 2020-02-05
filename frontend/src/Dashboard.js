import React from "react";
import axios from "axios";
import { AuthContext } from "./Auth";
import { Grid } from "@material-ui/core";
import LineChart from "./LineChart";

const PAGES = [
  { title: "My Repositories", key: "myRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" }
];

function Dashboard() {
  const { user } = React.useContext(AuthContext);
  const [page, setPage] = React.useState(PAGES[0]);
  const [data, setData] = React.useState({ myRepos: [] });

  React.useEffect(_ => {}, []);

  return (
    <Grid container>
      <Grid container item xs={12}>
        yo
      </Grid>
      <Grid item xs={3}>
        <nav>
          <ul>
            {PAGES.map(p => (
              <li key={p.key} onClick={_ => setPage(p.key)}>
                {p.title}
              </li>
            ))}
          </ul>
        </nav>
      </Grid>

      <Grid item xs={9}>
        <div>
          {data[page.key].map(d => (
            <LineChart data={d} />
          ))}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
