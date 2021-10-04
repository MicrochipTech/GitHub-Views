import React from "react";
import moment from "moment";
import randomColor from "randomcolor";
import { add0s, dailyToMonthlyReducer, downloadExcelFile } from "../utils";
import { Grid, Select, MenuItem } from "@material-ui/core";
import LineChart from "../Chart/LineChart";

function PopularContentTab({ repo }) {
  const [downloadSelectOpen, setDownloadSelectOpen] = React.useState(false);

  const handleClose = () => {
    setDownloadSelectOpen(false);
  };

  const handleOpen = () => {
    setDownloadSelectOpen(true);
  };

  if (repo.contents.length === 0) {
    return "This repository has no Popular Contents data";
  }

  const popularContentRowData = repo.contents.map((r) => {
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

  const popularContentPlotData = {
    timestamp: popularContentRowData[0].data.map((h) =>
      moment(h.timestamp).format("DD MMM YYYY")
    ),
    data: popularContentRowData.reduce((acc, r) => {
      const uniques = r.data.map((d) => d.uniques);
      const views = r.data.map((d) => d.count);
      const shortPath = r.path.replace(repo.reponame, "");
      acc.push({
        label: `${shortPath} uniques`,
        dataset: uniques,
        color: randomColor(),
      });
      acc.push({
        label: `${shortPath} views`,
        color: randomColor(),
        dataset: views,
      });
      return acc;
    }, []),
  };

  function dailyContents() {
    const rows = [["content"]];

    let tableHead = ["path", "type"];
    tableHead = tableHead.concat(popularContentPlotData.timestamp);
    rows.push(tableHead);

    popularContentPlotData.data.forEach((d) => {
      const referrerEntry = d.label.split(" ");
      rows.push(referrerEntry.concat(d.dataset));
    });

    return rows;
  }

  return (
    <Grid item xs={12}>
      <LineChart data={popularContentPlotData} />

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
                  const dailyContentsData = dailyContents();
                  const monthlyContentsData = dailyToMonthlyReducer(
                    dailyContentsData
                  );
                  downloadExcelFile(
                    monthlyContentsData,
                    `${repo.reponame}-monthly_content.xlsx`
                  );
                }
                break;
              case "daily":
                {
                  const dailyContentsData = dailyContents();
                  downloadExcelFile(
                    dailyContentsData,
                    `${repo.reponame}-daily_content.xlsx`
                  );
                }
                break;
              default:
                throw Error("Unknown downlaod type requested.");
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

export default PopularContentTab;
