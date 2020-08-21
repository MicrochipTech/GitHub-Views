import React from "react";
import moment from "moment";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { DataContext } from "./Data";
import { Grid, Typography, CircularProgress } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import randomColor from "randomcolor";
import Header from "./Header";
import LineChart from "./LineChart";
import { add0s, dailyToMonthlyReducer } from "./utils";

import "./SingleRepo.css";

function ViewsTab({ repo }) {
  const viewsPlotData = {
    timestamp: repo.views.map(h => moment(h.timestamp).format("DD MMM YYYY")),
    data: [repo].reduce((acc, e) => {
      const repo = e;
      const views = repo.views.map(h => h.count);
      const uniques = repo.views.map(h => h.uniques);
      acc.push({
        label: `Views`,
        dataset: views,
        color: "#603A8B"
      });
      acc.push({
        label: `Unique Views`,
        dataset: uniques,
        color: "#FDCB00"
      });
      return acc;
    }, [])
  };

  return (
    <Grid item xs={12}>
      <LineChart data={viewsPlotData} />
    </Grid>
  );
}

function ClonesTab({ repo }) {
  const clonesPlotData = {
    timestamp: repo.clones.data.map(h =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: [repo].reduce((acc, e) => {
      const repo = e;
      const clones = repo.clones.data.map(h => h.count);
      const cloners = repo.clones.data.map(h => h.uniques);
      acc.push({
        label: `Clones`,
        dataset: clones,
        color: "#603A8B"
      });
      acc.push({
        label: `Unique Cloners`,
        dataset: cloners,
        color: "#FDCB00"
      });
      return acc;
    }, [])
  };

  return (
    <Grid item xs={12}>
      <LineChart data={clonesPlotData} />
    </Grid>
  );
}

function ReferringSitesTab({ repo }) {
  if (repo.referrers.length === 0) {
    return "This repository has no Referring Sites data";
  }

  const referrersRowData = repo.referrers.map(r => {
    // remove duplicates from r.data based on r.data[i].timestamp
    // add0s in the sparse array
    let uniq = {};
    return {
      ...r,
      data: add0s(
        r.data.filter(
          obj => !uniq[obj.timestamp] && (uniq[obj.timestamp] = true)
        )
      )
    };
  });

  const referringSitePlotData = {
    timestamp: referrersRowData[0].data.map(h =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: referrersRowData.reduce((acc, r) => {
      const uniques = r.data.map(d => d.uniques);
      const views = r.data.map(d => d.count);
      acc.push({
        label: `${r.name} uniques`,
        dataset: uniques,
        color: randomColor()
      });
      acc.push({
        label: `${r.name} views`,
        dataset: views,
        color: randomColor()
      });
      return acc;
    }, [])
  };

  function dailyReferrers() {
    /* First row contains the name of the repository */
    const rows = [ [ repo.reponame ] ];

    let tableHead = ["referrer", "type"];
    tableHead = tableHead.concat(referringSitePlotData.timestamp);
    rows.push(tableHead);

    referringSitePlotData.data.forEach(d => {
      const referrerEntry = d.label.split(" ");
      rows.push(referrerEntry.concat(d.dataset));
    });

    return rows;
  }

  return (
    <Grid item xs={12}>
      <LineChart data={referringSitePlotData} />
      <a href="#" onClick={() => {
          const dailyReferrersData = dailyReferrers();
          console.log(dailyReferrersData);
      }}>Download Daily as Excel</a>
      <a href="#" onClick={() => {
          const dailyReferrersData = dailyReferrers();
          const monthlyReferrersData = dailyToMonthlyReducer(dailyReferrersData);
          console.log(monthlyReferrersData);
      }}>Download Monthly as Excel</a>
    </Grid>
  );
}

function PopularContentTab({ repo }) {
  if (repo.contents.length === 0) {
    return "This repository has no Popular Contents data";
  }

  const popularContentRowData = repo.contents.map(r => {
    // remove duplicates from r.data based on r.data[i].timestamp
    // add0s in the sparse array
    let uniq = {};
    return {
      ...r,
      data: add0s(
        r.data.filter(
          obj => !uniq[obj.timestamp] && (uniq[obj.timestamp] = true)
        )
      )
    };
  });

  const popularContentPlotData = {
    timestamp: popularContentRowData[0].data.map(h =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: popularContentRowData.reduce((acc, r) => {
      const uniques = r.data.map(d => d.uniques);
      const views = r.data.map(d => d.count);
      const shortPath = r.path.replace(repo.reponame, "");
      acc.push({
        label: `${shortPath} uniques`,
        dataset: uniques,
        color: randomColor()
      });
      acc.push({
        label: `${shortPath} views`,
        color: randomColor(),
        dataset: views
      });
      return acc;
    }, [])
  };

  function dailyContents() {
    const rows = [ [ repo.reponame ] ];

    let tableHead = ["content", "type"];
    tableHead = tableHead.concat(popularContentPlotData.timestamp);
    rows.push(tableHead);
    
    popularContentPlotData.data.forEach(d => {
      const referrerEntry = d.label.split(" ");
      rows.push(referrerEntry.concat(d.dataset));
    });

    return rows;
  }

  return (
    <Grid item xs={12}>
      <LineChart data={popularContentPlotData} />
      <a href="#" onClick={()=>{
          const dailyContentsData = dailyContents();
          console.log(dailyContentsData);
      }}>Download Daily as Excel</a>
      <a href="#" onClick={()=>{
          const dailyContentsData = dailyContents();
          const monthlyContentsData = dailyToMonthlyReducer(dailyContentsData);
          console.log(monthlyContentsData);
      }}>Download Monthly as Excel</a>
    </Grid>
  );
}

function ForksTab({ repo }) {
  const forksRaw = add0s([...repo.forks.data]);
  const forksPlotData = {
    timestamp: forksRaw.map(h => moment(h.timestamp).format("DD MMM YYYY")),
    data: [repo].reduce((acc, e) => {
      const repo = e;
      const forks = forksRaw.map(h => h.count);
      acc.push({
        label: `Forks`,
        dataset: forks,
        color: "#603A8B"
      });
      return acc;
    }, [])
  };
  console.log(forksPlotData);
  return (
    <Grid item xs={12}>
      <LineChart data={forksPlotData} />
    </Grid>
  );
}

function ForksTreeItem({ item }) {
  return (
    <TreeItem nodeId={item.github_repo_id} label={item.reponame}>
      {item.children.map(i => (
        <ForksTreeItem key={i.github_repo_id} item={i} />
      ))}
    </TreeItem>
  );
}

function ForksTreeTab({ repo }) {
  const [treeData, setTreeData] = React.useState([]);
  const [
    isLayeFetchingInProgress,
    setIsLazzyFetchingInProgress
  ] = React.useState(false);

  React.useEffect(() => {
    if (repo.forks.tree_updated) {
      setTreeData(repo.forks.children);
    } else {
      axios
        .post("/api/repo/updateForksTree", {
          repo_id: repo._id
        })
        .then(res => {
          console.log(res);
          setTreeData(res.data.treeData);
          setIsLazzyFetchingInProgress(false);
        });
      setIsLazzyFetchingInProgress(true);
    }
  }, []);

  if (isLayeFetchingInProgress) {
    return <CircularProgress />;
  }

  return (
    <Grid item xs={12}>
      {!isLayeFetchingInProgress &&
        treeData.length === 0 &&
        "This repository has no forks yet."}
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {treeData.map(i => (
          <ForksTreeItem key={i.github_repo_id} item={i} />
        ))}
      </TreeView>
    </Grid>
  );
}

function SingleRepo() {
  const tabOptions = {
    Views: ViewsTab,
    Clones: ClonesTab,
    "Referring Sites": ReferringSitesTab,
    "Popular Content": PopularContentTab,
    Forks: ForksTab,
    "Forks Tree": ForksTreeTab
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
    .find(r => r._id === repoId);
  const TheTab = tabOptions[curretTab];

  return (
    <Grid container className="dashboardWrapper">
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Link
        to={{
          pathname: "/dashboard/userRepos"
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
          {Object.keys(tabOptions).map(k => (
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
