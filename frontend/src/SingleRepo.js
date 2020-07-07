import React from "react";
import moment from "moment";
import  {useParams, Link} from "react-router-dom"
import {DataContext} from "./Data";
import {
    Grid, Typography, CircularProgress
} from "@material-ui/core"
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
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

    const plotData = {
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
            <LineChart data={plotData}/>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Clones</Typography>
            <LineChart data={plotData}/>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Reffering Sites</Typography>
            <LineChart data={plotData}/>
        </Grid>
        <Grid item xs={12}>
            <Typography className="repoSectionTitle">Forks</Typography>
        </Grid>
    </Grid>
    );
}

export default SingleRepo;