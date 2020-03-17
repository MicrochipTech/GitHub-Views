import React from "react";
import produce from "immer";
import axios from "axios";

const DataContext = React.createContext();

function prepareRepo(repo) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);
  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);

  if (repo.views.length !== 0) {
    const first = new Date(repo.views[0].timestamp);
    const last = new Date(repo.views[repo.views.length - 1].timestamp);

    if (first.getTime() < firstTimestamp.getTime()) {
      firstTimestamp = first;
    }

    if (last.getTime() > lastTimestamp.getTime()) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  const timeIndex = firstTimestamp;

  while (timeIndex.getTime() <= lastTimestamp.getTime()) {
    if (repo.views[index] === undefined) {
      repo.views.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0
      });
    } else {
      const currentTimestamp = new Date(repo.views[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        repo.views.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return repo;
}

const reducer = (state, action) =>
  produce(state, draft => {
    switch (action.type) {
      case "START_LOADING":
        draft.loadingData = true;
        return draft;
      case "STOP_LOADING":
        draft.loadingData = false;
        return draft;
      case "DATA_READY":
        draft.repos = action.payload;
        draft.loadingData = false;
        return draft;
      case "UPDATE_CHART":
        for (let i = 0; i < draft.repos.aggregateCharts.length; i += 1) {
          if (draft.repos.aggregateCharts[i]._id === action.payload.id) {
            if (action.payload.state === true) {
              draft.repos.aggregateCharts[i].repo_list.push(
                action.payload.idToUpdate
              );
            } else {
              const idx = draft.repos.aggregateCharts[i].repo_list.indexOf(
                action.payload.idToUpdate
              );
              draft.repos.aggregateCharts[i].repo_list.splice(idx, 1);
            }
          }
        }

        return draft;

      case "ADD_CHART":
        draft.repos.aggregateCharts.push(action.payload.aggChart);
        return draft;

      case "DELETE_CHART":
        let indexToRemove;
        for (
          indexToRemove = 0;
          indexToRemove < draft.repos.aggregateCharts.length;
          indexToRemove += 1
        ) {
          if (
            draft.repos.aggregateCharts[indexToRemove]._id === action.payload.id
          ) {
            break;
          }
        }

        draft.repos.aggregateCharts.splice(indexToRemove, 1);

        return draft;
      default:
        throw Error("Dispatch unknown data action");
    }
  });

const reposInit = {
  userRepos: [],
  sharedRepos: [],
  aggregateCharts: []
};

function DataProvider({ children }) {
  const [data, dispatch] = React.useReducer(reducer, {
    repos: reposInit,
    loadingData: true
  });

  React.useEffect(
    _ => {
      const getData = async _ => {
        const res = await axios.get("/api/user/getData").catch(e => {});
        if (res != null) {
          res.data.userRepos = res.data.userRepos.map(r => prepareRepo(r));
          res.data.sharedRepos = res.data.sharedRepos.map(r => prepareRepo(r));

          dispatch({ type: "DATA_READY", payload: res.data });
        } else {
          dispatch({ type: "DATA_READY", payload: reposInit });
        }
      };
      getData();
    },
    [dispatch]
  );

  const syncRepos = async _ => {
    dispatch({ type: "START_LOADING" });
    const res = await fetch("/api/repo/sync");
    const json = await res.json();
    console.log(json);
    if (json.data) {
      json.data.userRepos = json.data.userRepos.map(r => prepareRepo(r));
      json.data.sharedRepos = json.data.sharedRepos.map(r => prepareRepo(r));
      dispatch({ type: "DATA_READY", payload: json.data });
    } else {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  const updateAggregateChart = (id, idToUpdate, state) => {
    dispatch({ type: "UPDATE_CHART", payload: { id, idToUpdate, state } });
  };

  const addAggregateChart = async aggChart => {
    dispatch({ type: "ADD_CHART", payload: { aggChart } });
  };

  const deleteAggregateChart = async id => {
    dispatch({ type: "DELETE_CHART", payload: { id } });
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        updateAggregateChart,
        syncRepos,
        addAggregateChart,
        deleteAggregateChart
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export { DataContext, DataProvider };
