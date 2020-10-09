import React from "react";
import { DataContext } from "../Data";
import {
  Modal,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import FilterableRepos from "./FilterableRepos";

const STRATEGY_ALL = 1,
  STRATEGY_NONE = 2,
  STRATEGY_CUSTOM = 3;

function DownloadFileConfigure({ open, onDownload, onClose }) {
  const { repos } = React.useContext(DataContext);

  const [reposToDownload, setReposToDownload] = React.useState([]);

  React.useEffect(() => {
    setReposToDownload(
      [...repos.userRepos, ...repos.sharedRepos].map((r) => r._id)
    );
  }, [repos]);

  const [sheets, setSheets] = React.useState([
    { name: "Views", checked: true },
    { name: "Clones", checked: true },
    { name: "Forks", checked: true },
    { name: "Referring Sites", checked: false },
    { name: "Popular Content", checked: false },
  ]);
  const [step, setStep] = React.useState(0);
  const [selectStrategy, setSelectStrategy] = React.useState(STRATEGY_ALL);

  React.useEffect(() => {
    if (selectStrategy === STRATEGY_ALL) {
      setReposToDownload(
        [...repos.userRepos, ...repos.sharedRepos].map((r) => r._id)
      );
    } else if (selectStrategy === STRATEGY_NONE) {
      setReposToDownload([]);
    }
  }, [selectStrategy]);

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
                  allRepos={[
                    ...repos.userRepos,
                    ...repos.sharedRepos,
                  ].sort((a, b) =>
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
                {sheets.map((s, idx) => (
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
                ))}
                <Button onClick={() => setStep(0)}>Back</Button>
                <Button
                  disabled={sheets.filter((s) => s.checked).length === 0}
                  onClick={() => {
                    const selectedRepos = [
                      ...repos.userRepos,
                      repos.sharedRepos,
                    ]
                      .filter((r) => reposToDownload.indexOf(r._id) !== -1)
                      .sort((a, b) =>
                        a.reponame.toLowerCase() < b.reponame.toLowerCase()
                          ? -1
                          : 1
                      );
                    onDownload(selectedRepos, sheets);
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DownloadFileConfigure;
