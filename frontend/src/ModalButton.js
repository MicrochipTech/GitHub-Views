import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  // paper: {
  //   borderRadius: "5px",
  //   outline: 0,
  //   backgroundColor: theme.palette.background.paper,
  //   padding: theme.spacing(2, 4, 3)
  // }
  paper: {
    position: "absolute",
    width: 500,
    top: "50px",
    outline: 0,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "5px"
  }
}));

function ModalButton({ children, button }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <div onClick={handleOpen}>{button}</div>
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
          <div className={classes.paper}>{children}</div>
        </Fade>
      </Modal>
    </div>
  );
}

export default ModalButton;
