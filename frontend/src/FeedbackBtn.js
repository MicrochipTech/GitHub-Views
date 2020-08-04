import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Modal } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    outline: "none",
    padding: theme.spacing(2, 4, 3)
  }
}));

function FeedbackBtn() {
  const classes = useStyles();
  const [
    feedbackInstructionsModalIsOpened,
    setFeedbackInstructionsModalIsOpened
  ] = React.useState(false);

  return (
    <div>
      <Modal
        className={classes.modal}
        open={feedbackInstructionsModalIsOpened}
        onClose={() => setFeedbackInstructionsModalIsOpened(false)}
      >
        <div className={classes.paper}>djsahdgsadkjad</div>
      </Modal>
      <div
        className="feebackBtn"
        onClick={() => setFeedbackInstructionsModalIsOpened(true)}
      >
        Feedback
      </div>
    </div>
  );
}

export default FeedbackBtn;
