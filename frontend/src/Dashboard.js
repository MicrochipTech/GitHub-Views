import React from "react";
import axios from "axios";
import { AuthContext } from "./Auth";
import { Grid, Button } from "@material-ui/core";
import LineChart from "./LineChart";

const PAGES = [
  { title: "My Repositories", key: "userRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" }
];

function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const [page, setPage] = React.useState(PAGES[0]);
  const [data, setUserData] = React.useState({
    userRepos: [],
    sharedRepos: [],
    aggregateCharts: []
  });

  React.useEffect(
    _ => {
      const getData = async _ => {
        const res = await axios.get("/api/user/getData").catch(e => {});
        console.log(res.data);
        if (res != null) {
          setUserData(res.data);
        }
      };
      getData();
    },
    [setUserData]
  );

  return (
    <Grid container>
      <Grid container item xs={12}>
        {user.username}

        <Button onClick={_ => logout()}>Logout</Button>
      </Grid>
      <Grid item xs={3}>
        <nav>
          <ul>
            {PAGES.map(p => (
              <li key={p.key} onClick={_ => setPage(p)}>
                {p.title}
              </li>
            ))}
          </ul>
        </nav>
      </Grid>

      <Grid item xs={9}>
        <div>
          {data[page.key].map(d => (
            <p>{d.reponame}</p>
          ))}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
