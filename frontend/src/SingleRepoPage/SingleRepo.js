import React from "react";
import { useParams, Link } from "react-router-dom";
import { DataContext } from "../Data";
import { Grid, Typography, CircularProgress } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Header from "../common/Header";

import "./SingleRepo.css";

import ViewsTab from "./ViewsTab";
import ClonesTab from "./ClonesTab";
import ReferringSitesTab from "./ReferringSitesTab";
import PopularContentTab from "./PopularContentTab";
import ForksTab from "./ForksTab";
import ForksTreeTab from "./ForksTreeTab";

function SingleRepo() {
  const tabOptions = {
    Views: ViewsTab,
    Clones: ClonesTab,
    "Referring Sites": ReferringSitesTab,
    "Popular Content": PopularContentTab,
    Forks: ForksTab,
    "Forks Tree": ForksTreeTab,
  };

  const { repoId } = useParams();
  const { repos, loadingData } = React.useContext(DataContext);
  const [curretTab, setCurrentTab] = React.useState(Object.keys(tabOptions)[0]);

  if (loadingData) {
    return (
      <Grid container className="dashboardWrapper">
        <Grid item xs={12}>
          <Header />
        </Grid>
        <center>
          <CircularProgress />
        </center>
      </Grid>
    );
  }

  const repo = repos.userRepos
    .concat(repos.sharedRepos)
    .concat(repos.zombieRepos)
    .find((r) => r._id === repoId);
  const TheTab = tabOptions[curretTab];

  return (
    <Grid container className="dashboardWrapper">
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Link
        to={{
          pathname: "/dashboard/userRepos",
        }}
      >
        <div className="backBtn">
          <ArrowBackIcon className="backBtnIcon" />
          Back to repo list
        </div>
      </Link>

      <Grid item xs={12}>
        <Typography className="repoTitle" style={{ fontSize: "30px" }}>
          {repo.reponame}
        </Typography>
      </Grid>

      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <ul className="dataNav">
          {Object.keys(tabOptions).map((k) => (
            <li
              className={k === curretTab ? "active" : ""}
              key={k}
              onClick={() => setCurrentTab(k)}
            >
              {k}
            </li>
          ))}
        </ul>
      </Grid>

      <TheTab repo={repo} />
    </Grid>
  );
}

export default SingleRepo;
