import React from "react";
import moment from "moment";
import randomColor from "randomcolor";
import { add0s, dailyToMonthlyReducer, downloadExcelFile } from "../utils";
import { Grid, Select, MenuItem } from "@material-ui/core";
import LineChart from "../Chart/LineChart";

function ReferringSitesTab({ repo }) {
  const [downloadSelectOpen, setDownloadSelectOpen] = React.useState(false);

  const handleClose = () => {
    setDownloadSelectOpen(false);
  };

  const handleOpen = () => {
    setDownloadSelectOpen(true);
  };

  if (repo.referrers.length === 0) {
    return "This repository has no Referring Sites data";
  }

  const referrersRowData = repo.referrers.map((r) => {
    // remove duplicates from r.data based on r.data[i].timestamp
    // add0s in the sparse array
    let uniq = {};
    return {
      ...r,
      data: add0s(
        r.data.filter(
          (obj) => !uniq[obj.timestamp] && (uniq[obj.timestamp] = true)
        )
      ),
    };
  });

  const referringSitePlotData = {
    timestamp: referrersRowData[0].data.map((h) =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: referrersRowData.reduce((acc, r) => {
      const uniques = r.data.map((d) => d.uniques);
      const views = r.data.map((d) => d.count);
      acc.push({
        label: `${r.name} uniques`,
        dataset: uniques,
        color: randomColor(),
      });
      acc.push({
        label: `${r.name} views`,
        dataset: views,
        color: randomColor(),
      });
      return acc;
    }, []),
  };

  function dailyReferrers() {
    /* First row contains the name of the repository */
    const rows = [["referrers"]];

    let tableHead = ["referrer", "type"];
    tableHead = tableHead.concat(referringSitePlotData.timestamp);
    rows.push(tableHead);

    referringSitePlotData.data.forEach((d) => {
      const referrerEntry = d.label.split(" ");
      rows.push(referrerEntry.concat(d.dataset));
    });

    return rows;
  }

  return (
    <Grid item xs={12}>
      <LineChart data={referringSitePlotData} />

      <li className="downloadBtnOnTab" onClick={handleOpen}>
        Download as Excel
      </li>
      {downloadSelectOpen && (
        <Select
          open={downloadSelectOpen}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={(e) => {
            switch (e.target.value) {
              case "monthly":
                {
                  const dailyReferrersData = dailyReferrers();
                  const monthlyReferrersData = dailyToMonthlyReducer(
                    dailyReferrersData
                  );
                  downloadExcelFile(
                    monthlyReferrersData,
                    `${repo.reponame}-monthly_referrals.xlsx`
                  );
                }
                break;
              case "daily":
                {
                  const dailyReferrersData = dailyReferrers();
                  downloadExcelFile(
                    dailyReferrersData,
                    `${repo.reponame}-daily_referrals.xlsx`
                  );
                }
                break;
              default:
                throw Error("Unknown download type requested.");
            }
          }}
        >
          <MenuItem value="monthly">Monthly view</MenuItem>
          <MenuItem value="daily">Daily view</MenuItem>
        </Select>
      )}
    </Grid>
  );
}

export default ReferringSitesTab;
