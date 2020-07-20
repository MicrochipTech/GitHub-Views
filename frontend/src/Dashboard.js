import React from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./Auth";
import { DataContext } from "./Data";
import { Grid } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import NewAggregateChartButton from "./NewAggregateChartButton";
import SearchBar from "./SearchBar";
import Header from "./Header";
import { Navigation, PAGES } from "./Navigation";
import Pagination from "react-js-pagination";
import Repository from "./Repository";
import SelfShare from "./SelfShare";
import "./Dashboard.css";

const ITEMS_PER_PAGE = 15;

function Dashboard() {
  const { page } = useParams();
  const { repos, loadingData } = React.useContext(DataContext);
  const { user } = React.useContext(AuthContext);
  const [searchValue, setSearchValue] = React.useState("");
  const [activePage, setActivePage] = React.useState(1);
  // const [page, setPage] = React.useState(user.githubId ? PAGES[0] : PAGES[1]);

  console.log(repos, page);
  const reposMatchingSerach = repos[page].filter(
    d =>
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

  return (
    <Grid container className="dashboardWrapper">
      <Header />

      <Grid item md={2}>
        <Navigation />
      </Grid>

      <Grid item md={10}>
        <SearchBar
          show={!loadingData && page !== "aggregateCharts"}
          onSearch={q => {
            setActivePage(1);
            setSearchValue(q);
          }}
        />

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
                  visibleRepos
                }}
              />
            ))}

          {loadingData && (
            <center className="padding20">
              <CircularProgress />
            </center>
          )}

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

          {!loadingData && page === "sharedRepos" && <SelfShare />}

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
