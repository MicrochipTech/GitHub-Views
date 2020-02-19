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
      case "DATA_READY":
        draft.repos = action.payload;
        draft.loadingData = false;
        return draft;
      case "UPDATE_CHART":
        const repoToEdit = draft.repos.aggregateCharts.filter(r =>r._id === action.payload.id)[0];
      
        if(action.payload.state === true) {
          repoToEdit.repo_list.push(action.payload.idToUpdate);
        } else {
          const idx = repoToEdit.repo_list.indexOf(action.payload.idToUpdate);
          repoToEdit.repo_list.splice(idx, 1);
        }

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
          //console.log(res.data);
          res.data.userRepos = res.data.userRepos.map(r => prepareRepo(r));
          res.data.sharedRepos = res.data.sharedRepos.map(r => prepareRepo(r));
          //console.log(res.data);
          dispatch({ type: "DATA_READY", payload: res.data });
        } else {
          dispatch({ type: "DATA_READY", payload: reposInit });
        }
      };
      getData();
    },
    [dispatch]
  );

  const updateAggregateChart = async (id, idToUpdate, state) => {
    dispatch({type: "UPDATE_CHART", payload: {id, idToUpdate, state}});
  };

  return <DataContext.Provider value={{...data, updateAggregateChart}}>{children}</DataContext.Provider>;
}

export { DataContext, DataProvider };
