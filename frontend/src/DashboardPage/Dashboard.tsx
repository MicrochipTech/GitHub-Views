import React from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../Data";
import { Grid } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import NewAggregateChartButton from "./NewAggregateChartButton";
import SearchBar from "./SearchBar";
import Header from "../common/Header";
import Navigation from "./Navigation";
import Pagination from "react-js-pagination";
import Repository from "./Repository";
import SelfShare from "./SelfShare";
import InfoIcon from "./InfoIcon";
import "./Dashboard.css";
import Center from "../common/Center";

type Repo = any; // untill a better typing

function Dashboard() {
  const { section } = useParams<{ section: string }>();
  const {
    repos,
    loadingData,
    setPageNo,
    page_no,
    setSearch,
    page_size,
    names,
  } = React.useContext(DataContext);

  // TODO: different components based on section, to clear the conditional mess below

  return (
    <Grid container className="dashboardWrapper">
      <Header />

      <Grid item md={2}>
        <Navigation />
      </Grid>

      <Grid item md={10}>
        {loadingData && (
          <Center className="padding20">
            <CircularProgress />
          </Center>
        )}

        <SearchBar
          show={!loadingData && section !== "aggregateCharts"}
          onSearch={(q: string) => {
            setPageNo(0);
            setSearch(q);
          }}
        />

        {!loadingData && ["userRepos", "mchpRepos"].includes(section) && (
          <InfoIcon />
        )}

        <div>
          {!loadingData &&
            names.length > page_size &&
            ["userRepos", "mchpRepos"].includes(section) && (
              <Pagination
                activePage={page_no + 1}
                itemsCountPerPage={page_size}
                totalItemsCount={names.length}
                pageRangeDisplayed={15}
                onChange={(p: number) => setPageNo(p - 1)}
              />
            )}

          {!loadingData &&
            repos[section].length !== 0 &&
            repos[section].map((d: Repo, idx: number) => (
              <Repository
                key={d._id}
                index={idx}
                data={{
                  page: section,
                  visibleRepos: repos[section],
                }}
              />
            ))}

          {!loadingData && repos[section].length === 0 && (
            <div>
              <br />
              <div className="nothing">
                Nothing to show here.
                {section === "aggregateCharts" && (
                  <div>
                    <NewAggregateChartButton text="Create First Aggregate Chart" />
                  </div>
                )}
              </div>
            </div>
          )}

          {!loadingData && section === "sharedRepos" && (
            <SelfShare
              onRepoAdded={() => {
                // setSearchValue("");
                // setActivePage(repos[section].length / ITEMS_PER_PAGE + 1);
              }}
            />
          )}

          {!loadingData &&
            section === "aggregateCharts" &&
            repos[section].length > 0 && (
              <Center>
                <NewAggregateChartButton text="Create New Aggregate Chart" />
              </Center>
            )}
        </div>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
