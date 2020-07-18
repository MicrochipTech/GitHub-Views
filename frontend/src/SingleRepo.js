import React from "react";
import moment from "moment";
import axios from "axios"
import  {useParams, Link} from "react-router-dom"
import {DataContext} from "./Data";
import {
    Grid, Typography, CircularProgress, 
} from "@material-ui/core"
import {TreeView, TreeItem} from "@material-ui/lab"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import randomColor from "randomcolor"
import Header from "./Header"
import LineChart from "./LineChart"
import { add0s } from "./utils"

import "./SingleRepo.css"

function ViewsTab({repo}) {
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
        <Typography className="repoSectionTitle">Views</Typography>
        <LineChart data={viewsPlotData}/>
    </Grid>
  );
}

function ClonesTab({repo}) {
  const clonesPlotData = {
    timestamp: repo.clones.data.map(h => moment(h.timestamp).format("DD MMM YYYY")),
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
      <Typography className="repoSectionTitle">Clones</Typography>
      <LineChart data={clonesPlotData}/>
    </Grid> 
  );
}

function ReferringSitesTab({repo}) {
  const referrersRowData = repo.referrers.map(r => {
    // remove duplicates from r.data based on r.data[i].timestamp 
    // add0s in the sparse array
    let uniq = {}
    return {...r, data: 
      add0s(r.data.filter(obj => !uniq[obj.timestamp] && (uniq[obj.timestamp] = true)))
    };
  })

  const referringSitePlotData = {
    timestamp: referrersRowData[0].data.map(h => moment(h.timestamp).format("DD MMM YYYY")),
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
  }


  return (
    <Grid item xs={12}>
        <Typography className="repoSectionTitle">Reffering Sites</Typography>
        <LineChart data={referringSitePlotData}/>
    </Grid>
  )
}

function PopularContentTab({repo}) {
  const popularContentRowData = repo.contents.map(r => {
    // remove duplicates from r.data based on r.data[i].timestamp 
    // add0s in the sparse array
    let uniq = {}
    return {
      ...r, 
      data: 
        add0s(r.data.filter(obj => !uniq[obj.timestamp] && (uniq[obj.timestamp] = true)))
    };
  })

  const popularContentPlotData = {
    timestamp: popularContentRowData[0].data.map(h => moment(h.timestamp).format("DD MMM YYYY")),
    data: popularContentRowData.reduce((acc, r) => {
      const uniques = r.data.map(d => d.uniques);
      const views = r.data.map(d => d.count);
      const shortPath = r.path.replace(repo.reponame, "")
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
  }
  
  return (
    <Grid item xs={12}>
        <Typography className="repoSectionTitle">Popular Content</Typography>
        <LineChart data={popularContentPlotData}/>
    </Grid>
  )
}

function ForksTab({repo}) {
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
console.log(forksPlotData)
  return (
     <Grid item xs={12}>
        <Typography className="repoSectionTitle">Views</Typography>
        <LineChart data={forksPlotData}/>
      </Grid>
  );
}

function ForksTreeTab({repo}) {
  axios.post("/api/repo/updateForksTree", {
    repo_id: repo._id,
  }).then(res => {
    console.log(res)
  })
  return (
    <Grid item xs={12}>
            <Typography className="repoSectionTitle">Forks</Typography>
                    <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              <TreeItem nodeId="1" label="Applications">
                <TreeItem nodeId="2" label="Calendar" />
                <TreeItem nodeId="3" label="Chrome" />
                <TreeItem nodeId="4" label="Webstorm" />
              </TreeItem>
              <TreeItem nodeId="5" label="Documents">
                <TreeItem nodeId="10" label="OSS" />
                <TreeItem nodeId="6" label="Material-UI">
                  <TreeItem nodeId="7" label="src">
                    <TreeItem nodeId="8" label="index.js" />
                    <TreeItem nodeId="9" label="tree-view.js" />
                  </TreeItem>
                </TreeItem>
              </TreeItem>
            </TreeView>
        </Grid>
  )
}
 
function SingleRepo() {
    const tabOptions = {
      Views: ViewsTab,
      Clones: ClonesTab,
      "Referring Sites": ReferringSitesTab,
      "Popular Content": PopularContentTab,
      Forks: ForksTab,
      "Forks Tree": ForksTreeTab
    }
    
    const {repoId} = useParams();
    const {repos,loadingData} = React.useContext(DataContext);
    const [curretTab, setCurrentTab] = React.useState(Object.keys(tabOptions)[0])
  
    if(loadingData) {
        return (
            <Grid container className="dashboardWrapper">
                <Grid item xs={12}><Header/></Grid>
                <center>
                    <CircularProgress/>
                </center>
            </Grid>
            )
    }
    
    const repo = repos.userRepos.concat(repos.sharedRepos).concat(repos.zombieRepos).find(r => r._id === repoId)
    console.log(repo);
    const TheTab = tabOptions[curretTab]

    return (
    <Grid container className="dashboardWrapper">
        <Grid item xs={12}>
            <Header/>
        </Grid>
        <Link to={{
            pathname:"/dashboard/userRepos"
        }}>
            <div className="backBtn">
                <ArrowBackIcon className="backBtnIcon"/>
                Back to repo list
            </div>
        </Link>
        
        <Grid item xs={12}>
            <Typography className="repoTitle" style={{fontSize:"30px"}}>{repo.reponame}</Typography>
        </Grid>

        <Grid item xs={12}>
          <ul className="dataNav">
          {Object.keys(tabOptions).map(k => <li 
            className={k===curretTab?"active":""} 
            key={k}
            onClick={() => setCurrentTab(k)}>
              {k}
            </li>
          )}
          </ul>
        </Grid>
        
        <TheTab repo={repo}/>

    </Grid>
    );
}

export default SingleRepo;