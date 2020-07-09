import React from "react";
import moment from "moment";
import  {useParams, Link} from "react-router-dom"
import {DataContext} from "./Data";
import {
    Grid, Typography, CircularProgress, 
} from "@material-ui/core"
import {TreeView, TreeItem} from "@material-ui/lab"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Header from "./Header"
import LineChart from "./LineChart"

import "./SingleRepo.css"

function SingleRepo() {
    const {repoId} = useParams();
    const {repos,loadingData} = React.useContext(DataContext);

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
            <Typography className="repoTitle">{repo.reponame}</Typography>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Views</Typography>
            <LineChart data={viewsPlotData}/>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Clones</Typography>
            <LineChart data={clonesPlotData}/>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Reffering Sites</Typography>
            <LineChart data={viewsPlotData}/>
        </Grid>
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
    </Grid>
    );
}

export default SingleRepo;