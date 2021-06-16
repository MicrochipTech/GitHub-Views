import React, {useState} from "react";
import produce from "immer";
import axios from "axios";
import { add0s } from "./utils";

import { prepareRepo, prepareData } from "./utils";

const DataContext = React.createContext();

const reducer = (state, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case "START_LOADING":
        draft.loadingData = true;
        return draft;
      case "STOP_LOADING":
        draft.loadingData = false;
        return draft;
      case "DATA_READY":
        draft.repos = action.payload.dataToPlot;
        draft.names = action.payload.names;
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
        draft.repos.sharedRepos.push({
          ...repo,
          views: { ...repo.views, data: add0s(repo.views.data) },
        });
        return draft;

      case "REMOVE_SHARED_REPO":
        const { repoId } = action.payload;
        draft.repos.sharedRepos = draft.repos.sharedRepos.filter(
          (r) => r._id !== repoId
        );
        return draft;

      default:
        throw Error("Dispatch unknown data action");
    }
  });

const reposInit = {
  userRepos: [],
  sharedRepos: [],
  aggregateCharts: [],
  zombieRepos: [],
};

function DataProvider({ children }) {
  const [page_no, setPageNo] = useState(0);
  const [page_size, setPageSize] = useState(30);
  const [search, setSearch] = useState("");

  const [data, dispatch] = React.useReducer(reducer, {
    repos: reposInit,
    names: [],
    loadingData: true,
  });

  React.useEffect(
    (_) => {
      const getData = async (_) => {
        dispatch({ type: "START_LOADING" });
        const res = await axios.get(`/api/user/getData?page_no=${page_no}&page_size=${page_size}&search=${search}`).catch((e) => {});
        if (res != null) {
          dispatch({
            type: "DATA_READY",
            payload: {
              dataToPlot: prepareData(res.data.dataToPlot),
              names: res.data.names,
            },
          });
        } else {
          dispatch({ type: "DATA_READY", payload: reposInit });
        }
      };
      getData();
    },
    [dispatch, page_no, page_size, search]
  );

  const syncRepos = async (_) => {
    dispatch({ type: "START_LOADING" });
    const res = await fetch("/api/user/sync");
    const json = await res.json();
    console.log(json);
    if (json.data) {
      dispatch({ type: "DATA_READY", payload: prepareData(json.data) });
    } else {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  const updateAggregateChart = (id, idToUpdate, state) => {
    dispatch({ type: "UPDATE_CHART", payload: { id, idToUpdate, state } });
  };

  const addAggregateChart = async (aggChart) => {
    dispatch({ type: "ADD_CHART", payload: { aggChart } });
  };

  const deleteAggregateChart = async (id) => {
    dispatch({ type: "DELETE_CHART", payload: { id } });
  };

  const addSharedRepo = (repo) => {
    dispatch({ type: "ADD_SHARED_REPO", payload: { repo: prepareRepo(repo) } });
  };

  async function unfollowSharedRepo(repoId) {
    const res = await fetch("/api/user/unfollowSharedRepo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoId }),
    });
    const resJson = await res.json();
    if (resJson.status === "ok") {
      dispatch({ type: "REMOVE_SHARED_REPO", payload: { repoId } });
    }
  }

  return (
    <DataContext.Provider
      value={{
        ...data,
        updateAggregateChart,
        syncRepos,
        addAggregateChart,
        deleteAggregateChart,
        addSharedRepo,
        unfollowSharedRepo,
        page_size, page_no,
        setPageNo,setPageSize,
        search, setSearch
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export { DataContext, DataProvider };
