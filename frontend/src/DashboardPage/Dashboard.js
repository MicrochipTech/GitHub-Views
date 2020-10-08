import React from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../Data";
import { Grid, Box, Popover } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoIcon from "@material-ui/icons/Info";
import NewAggregateChartButton from "./NewAggregateChartButton";
import SearchBar from "./SearchBar";
import Header from "../common/Header";
import Navigation from "./Navigation";
import Pagination from "react-js-pagination";
import Repository from "./Repository";
import SelfShare from "./SelfShare";
import "./Dashboard.css";

const ITEMS_PER_PAGE = 15;

function Dashboard() {
  const { page } = useParams();
  const { repos, loadingData } = React.useContext(DataContext);
  const [searchValue, setSearchValue] = React.useState("");
  const [activePage, setActivePage] = React.useState(1);
  const [infoIcon, setInfoIcon] = React.useState(null);

  console.log(repos, page);
  const reposMatchingSerach = repos[page].filter(
    (d) =>
      !d.reponame || d.reponame.match(new RegExp(`${searchValue.trim()}`, "i"))
  );
  const totalCount = reposMatchingSerach.length;

  const visibleRepos = reposMatchingSerach.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  React.useEffect(() => {
    setSearchValue("");
  }, [page]);

  const counterSplit = {};
  reposMatchingSerach.forEach((r) => {
    const org = r.reponame.split("/")[0];
    if (counterSplit[org] === undefined) {
      counterSplit[org] = 0;
    }
    counterSplit[org] += 1;
  });

  return (
    <Grid container className="dashboardWrapper">
      <Header />

      <Grid item md={2}>
        <Navigation />
      </Grid>

      <Grid item md={10}>
        {loadingData && (
          <center className="padding20">
            <CircularProgress />
          </center>
        )}

        <SearchBar
          show={!loadingData && page !== "aggregateCharts"}
          onSearch={(q) => {
            setActivePage(1);
            setSearchValue(q);
          }}
        />

        {!loadingData && (
          <Box display="flex" flexDirection="row" alignItems="center">
            <InfoIcon
              onClick={(e) => setInfoIcon(e.currentTarget)}
              style={{ cursor: "pointer" }}
            />
            <Popover
              anchorEl={infoIcon}
              open={infoIcon !== null}
              onClose={() => setInfoIcon(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Box p="10px">
                {Object.entries(counterSplit).map(([key, value]) => (
                  <div>
                    {value} - {key}
                  </div>
                ))}
              </Box>
            </Popover>
            &nbsp;
            <span>{totalCount} repos</span>
          </Box>
        )}

        <div>
          {totalCount > ITEMS_PER_PAGE && (
            <Pagination
              activePage={activePage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={totalCount}
              pageRangeDisplayed={5}
              onChange={setActivePage}
            />
          )}

          {!loadingData &&
            visibleRepos.length !== 0 &&
            visibleRepos.map((d, idx) => (
              <Repository
                key={d._id}
                index={idx}
                data={{
                  page,
                  visibleRepos,
                }}
              />
            ))}

          {!loadingData &&
            (repos[page].length === 0 || visibleRepos.length === 0) && (
              <div>
                <br />
                <div className="nothing">
                  Nothing to show here.
                  {page === "aggregateCharts" && (
                    <div>
                      <NewAggregateChartButton text="Create First Aggregate Chart" />
                    </div>
                  )}
                </div>
              </div>
            )}

          {!loadingData && page === "sharedRepos" && (
            <SelfShare
              onRepoAdded={() => {
                setSearchValue("");
                setActivePage(repos[page].length / ITEMS_PER_PAGE + 1);
              }}
            />
          )}

          {!loadingData &&
            page === "aggregateCharts" &&
            repos[page].length > 0 && (
              <center>
                <NewAggregateChartButton text="Create New Aggregate Chart" />
              </center>
            )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
