import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { DataContext } from "../Data";
import {AuthContext} from "../Auth";
import {
  Modal,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import FilterableRepos from "./FilterableRepos";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { prepareData } from "./../utils";

const STRATEGY_ALL = 1,
  STRATEGY_NONE = 2,
  STRATEGY_CUSTOM = 3;

function DownloadFileConfigure({ open, onDownload, onClose }) {
  const { repos, names } = useContext(DataContext);
  const {user} = useContext(AuthContext);

  const [reposToDownload, setReposToDownload] = useState([]);

  useEffect(() => {
    const reposToDownload = [...names, ...repos.sharedRepos].map((r) => r._id);

    setReposToDownload(reposToDownload);
  }, [repos, names]);

  /*************************************************************************************/

  const [sheets, setSheets] = useState([
    { name: "Views", checked: true },
    { name: "Clones", checked: true },
    { name: "Forks", checked: true },
  ]);

  const [step, setStep] = useState(0);

  const [selectStrategy, setSelectStrategy] = useState(STRATEGY_ALL);

  const [interval, setInterval] = useState([
    moment().subtract(1, "month").toDate(),
    moment().toDate(),
  ]);
  const [allTime, setAllTime] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (selectStrategy === STRATEGY_ALL) {
      setReposToDownload([...names, ...repos.sharedRepos].map((r) => r._id));
    } else if (selectStrategy === STRATEGY_NONE) {
      setReposToDownload([]);
    }
  }, [selectStrategy]);

  const onDownloadBtnClick = async () => {
    let query = "";
    let finalResponse = {
      data: {
        dataToPlot: {
          userRepos: [],
          mchpRepos: [],
          sharedRepos: [],
          aggregateCharts: [],
          githubId: null,
        },
      },
    };

    const reposField = user.msft_oid ? "mchpRepos" : "userRepos";

    if (!allTime) {
      query = `?start=${interval[0].toISOString()}&end=${interval[1].toISOString()}`;
      setFetching(true);
      const res = await axios.get(`/api/user/getData${query}`);
      setFetching(false);

      if (res === null) {
        alert("There was an error.");
        return;
      }
      finalResponse = res;
    } else {
      setFetching(true);
      let res;
      let cur_page = 0;
      do {
        res = await axios.get(
          `/api/user/getData?page_size=100&page_no=${cur_page++}&search=`
        );
        console.log(finalResponse, res);
        finalResponse.data.dataToPlot[reposField].push(
          ...res.data.dataToPlot[reposField]
        );
      } while (res.data.dataToPlot[reposField].length > 0);
      finalResponse.data.dataToPlot = {
        ...res.data.dataToPlot,
      [reposField]: finalResponse.data.dataToPlot[reposField],
      };
      console.log(finalResponse);
      setFetching(false);
    }

    const data = prepareData(finalResponse.data.dataToPlot);

    const selectedRepos = [...data[reposField], ...data.sharedRepos]
      .filter((r) => reposToDownload.indexOf(r._id) !== -1)
      .sort((a, b) =>
        a.reponame.toLowerCase() < b.reponame.toLowerCase() ? -1 : 1
      );

    console.log(selectedRepos);
    onDownload(selectedRepos, sheets);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="bareModal">
          {step === 0 && (
            <div>
              <div
                className="closeBtnWrapper"
                style={{ textAlign: "right", padding: "10px 10px 0px 0px" }}
              >
                <CloseIcon onClick={onClose} style={{ cursor: "pointer" }} />
              </div>
              <div className="padding20">
                <Typography variant="h6">
                  Configure the file to download
                </Typography>
                <Typography variant="subtitle1">
                  Select what repos to include
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectStrategy === STRATEGY_ALL}
                      onChange={(e) =>
                        setSelectStrategy(
                          e.target.checked ? STRATEGY_ALL : STRATEGY_NONE
                        )
                      }
                      color="primary"
                    />
                  }
                  label="All Repos"
                />
                <br />
                <span>
                  or manually select just a part of them (at leaset one)
                </span>
              </div>
              <hr />
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "scroll",
                  padding: "20px",
                }}
              >
                <FilterableRepos
                  allRepos={[...names, ...repos.sharedRepos].sort((a, b) =>
                    a.reponame.toLowerCase() < b.reponame.toLowerCase() ? -1 : 1
                  )}
                  selectedRepos={reposToDownload}
                  onChange={(id, selected) => {
                    if (selected) {
                      setReposToDownload([...reposToDownload, id]);
                    } else {
                      const newRtd = [...reposToDownload];
                      newRtd.splice(newRtd.indexOf(id), 1);
                      setReposToDownload(newRtd);
                      setSelectStrategy(STRATEGY_CUSTOM);
                    }
                  }}
                />
              </div>
              <hr />
              <div className="padding20">
                <Button
                  disabled={reposToDownload.length === 0}
                  onClick={() => setStep(1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div
                className="closeBtnWrapper"
                style={{ textAlign: "right", padding: "10px 10px 0px 0px" }}
              >
                <CloseIcon onClick={onClose} style={{ cursor: "pointer" }} />
              </div>
              <div className="padding20">
                <Typography variant="h6">Configure downlaoded file</Typography>
                <Typography variant="subtitle1">
                  Select what data to include for each repo (at leaset one)
                </Typography>
                <Grid container>
                  {sheets.map((s, idx) => (
                    <Grid key={idx} item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={s.checked}
                            onChange={(e) => {
                              const newSheets = [...sheets];
                              newSheets[idx].checked = e.target.checked;
                              setSheets(newSheets);
                            }}
                            color="primary"
                          />
                        }
                        label={s.name}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Box pt="20px" pb="20px">
                  <Typography variant="subtitle1">
                    Select the time interval to download data for
                  </Typography>
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allTime}
                          onChange={(e) => {
                            setAllTime(e.target.checked);
                          }}
                          color="primary"
                        />
                      }
                      label="All time data"
                    />
                    {!allTime && (
                      <div>
                        <div>Time interval:</div>
                        <DateRangePicker
                          onChange={(interval) => {
                            if (interval) {
                              setInterval(interval);
                            } else {
                              setInterval([
                                moment().subtract(1, "month").toDate(),
                                moment().toDate(),
                              ]);
                            }
                          }}
                          value={[...interval]}
                        />
                      </div>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Button onClick={() => setStep(0)}>Back</Button>
                  <Button
                    disabled={sheets.filter((s) => s.checked).length === 0}
                    onClick={onDownloadBtnClick}
                  >
                    {fetching && <CircularProgress size={14} />}&nbsp; Download
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DownloadFileConfigure;
