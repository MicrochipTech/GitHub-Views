import React from "react";
import produce from "immer";
import axios from "axios";
import { add0s } from "./utils";

const DataContext = React.createContext();

function prepareRepo(r) {
  return {
    ...r,
    views: add0s(r.views),
    clones: { ...r.clones, data: add0s(r.clones.data) }
  };
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

      case "ADD_SHARED_REPO":
        const { repo } = action.payload;
        draft.repos.sharedRepos.push({ ...repo, views: add0s(repo.views) });
        return draft;

      default:
        throw Error("Dispatch unknown data action");
    }
  });

const reposInit = {
  userRepos: [],
  sharedRepos: [],
  aggregateCharts: [],
  zombieRepos: []
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
          res.data.zombieRepos = res.data.userRepos
            .filter(r => r.not_found)
            .map(prepareRepo);

          res.data.userRepos = res.data.userRepos
            .filter(r => !r.not_found)
            .map(prepareRepo);

          res.data.sharedRepos = res.data.sharedRepos.map(prepareRepo);

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
    const res = await fetch("/api/user/sync");
    const json = await res.json();
    console.log(json);
    if (json.data) {
      json.data.zombieRepos = json.data.userRepos
        .filter(r => r.not_found)
        .map(prepareRepo);

      json.data.userRepos = json.data.userRepos
        .filter(r => !r.not_found)
        .map(prepareRepo);

      json.data.sharedRepos = json.data.sharedRepos.map(prepareRepo);

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

  const addSharedRepo = repo => {
    dispatch({ type: "ADD_SHARED_REPO", payload: { repo: prepareRepo(repo) } });
  };

  async function deleteSharedRpo(id) {}

  return (
    <DataContext.Provider
      value={{
        ...data,
        updateAggregateChart,
        syncRepos,
        addAggregateChart,
        deleteAggregateChart,
        addSharedRepo,
        deleteSharedRpo
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export { DataContext, DataProvider };
