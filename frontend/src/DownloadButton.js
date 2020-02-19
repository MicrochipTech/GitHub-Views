import React from "react";
import { Select, MenuItem } from "@material-ui/core";

function DownloadButton() {
  const [downloadSelectOpen, setDownloadSelectOpen] = React.useState(false);

  const handleClose = () => {
    setDownloadSelectOpen(false);
  };

  const handleOpen = () => {
    setDownloadSelectOpen(true);
  };

  return (
    <div>
      <li onClick={handleOpen}>Download as CSV</li>
      {downloadSelectOpen && (
        <Select
          open={downloadSelectOpen}
          onClose={handleClose}
          onOpen={handleOpen}
        >
          <MenuItem value="monthly">Monthly view</MenuItem>
          <MenuItem value="daily">Daily view</MenuItem>
        </Select>
      )}
    </div>
  );
}

export default DownloadButton;
