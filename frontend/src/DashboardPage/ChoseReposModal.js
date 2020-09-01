import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import EditIcon from "@material-ui/icons/Edit";
import { Button, Switch } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    position: "absolute",
    width: 500,
    top: "50px",
    outline: 0,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "5px"
  }
}));

function ChoseReposModal({
  chartToEdit,
  allRepos,
  icon,
  onDone,
  onChange,
  onClose,
  selectedRepos = []
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState(
    allRepos.map(r => selectedRepos.indexOf(r._id) !== -1)
  );
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose(selectedRepos);
    }

    setOpen(false);
  };
  const [searchAggFilter, setSearchAggFilter] = React.useState("");
  const reposMatchingSearch = allRepos
    .map((i, idx) => ({ ...i, originalIdx: idx }))
    .filter(
      d =>
        !d.reponame ||
        d.reponame.match(new RegExp(`${searchAggFilter.trim()}`, "i"))
    );

  return (
    <div>
      <div onClick={handleOpen}>
        <div className="icon">{icon !== undefined ? icon : <EditIcon />}</div>
      </div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <div className="padding20">
              <h2 id="transition-modal-title">Select repositories:</h2>
            </div>
            <hr />
            <div className="padding20 selectReposWrapper">
              <TextField
                className="padding20"
                label="Search"
                variant="outlined"
                style={{ width: "100%" }}
                value={searchAggFilter}
                onChange={e => {
                  setSearchAggFilter(e.target.value);
                }}
              />
              {reposMatchingSearch.length !== 0 &&
                reposMatchingSearch.map((r, idx) => (
                  <div key={r._id} style={{ disaply: "flex" }}>
                    <Switch
                      checked={values[r.originalIdx]}
                      onChange={e => {
                        const newValues = [...values];
                        newValues[r.originalIdx] = e.target.checked;
                        console.log(r.originalIdx);
                        setValues(newValues);
                        if (onChange) {
                          onChange(r._id, e.target.checked);
                        }
                      }}
                    />
                    <span style={{ wordBreak: "break-all" }}>{r.reponame}</span>
                  </div>
                ))}
              {allRepos.length === 0 && (
                <div>
                  <h3>You don't have any repositories.</h3>
                </div>
              )}
            </div>
            <hr />
            <div className="padding20">
              <Button onClick={handleClose}>Close</Button>
              <Button
                onClick={_ => {
                  if (onDone) {
                    onDone();
                  }
                  handleClose();
                }}
                disabled={selectedRepos.length === 0}
              >
                Done
              </Button>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

export default ChoseReposModal;
