import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import ShareIcon from "@material-ui/icons/Share";
import Autocomplete from "./Autocomplete";
import { Button } from "@material-ui/core";

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

function ShareButton({ repoId }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div onClick={handleOpen}>
        <div className="icon">
          <ShareIcon />
        </div>
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
              <h2 id="transition-modal-title">Share this repository with:</h2>
            </div>
            <hr />
            <div className="padding20">
              <Autocomplete onChange={setUsername} />
            </div>
            <hr />
            <div className="padding20">
              <Button onClick={handleClose}>Close</Button>
              <Button
                onClick={_ => {
                  fetch("/api/repo/share", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      repoId,
                      username
                    })
                  });
                  handleClose();
                }}
              >
                Share
              </Button>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

export default ShareButton;
