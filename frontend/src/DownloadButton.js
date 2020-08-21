import React from "react";
import { DataContext } from "./Data";
import { Select, MenuItem } from "@material-ui/core";
import moment from "moment";
import XLSX from "xlsx";
import { compareDate, searchDate } from "./utils";

function viewsCsv(concatRepos) {
  let minimumTimetamp = new Date();
  minimumTimetamp.setUTCHours(0, 0, 0, 0);
  const maximumTimetamp = new Date();
  maximumTimetamp.setUTCHours(0, 0, 0, 0);

  const tableHead = ["reponame", "type"];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let firstRepoTimestamp = new Date(concatRepos[i].views[0].timestamp);
    if (firstRepoTimestamp < minimumTimetamp) {
      minimumTimetamp = firstRepoTimestamp;
    }
  }
  let timeIndex = new Date(minimumTimetamp.getTime());
  timeIndex.setUTCHours(0, 0, 0, 0);

  while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
    tableHead.push(moment(timeIndex).format("DD MMM YYYY"));
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }
  const rows = [tableHead];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let countsCSV = [concatRepos[i].reponame, "count"];
    let uniquesCSV = [concatRepos[i].reponame, "unique"];

    const limitTimestamp = new Date(concatRepos[i].views[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {
      countsCSV.push(0);
      uniquesCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const views = concatRepos[i].views.map(h => h.count);
    const uniques = concatRepos[i].views.map(h => h.uniques);

    countsCSV = countsCSV.concat(views);
    uniquesCSV = uniquesCSV.concat(uniques);

    rows.push(countsCSV);
    rows.push(uniquesCSV);
  }
  return rows;
}

function clonesCsv(concatRepos) {
  let minimumTimetamp = new Date();
  minimumTimetamp.setUTCHours(0, 0, 0, 0);
  const maximumTimetamp = new Date();
  maximumTimetamp.setUTCHours(0, 0, 0, 0);

  const tableHead = ["reponame", "type"];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let firstRepoTimestamp = new Date(concatRepos[i].clones.data[0].timestamp);
    if (firstRepoTimestamp < minimumTimetamp) {
      minimumTimetamp = firstRepoTimestamp;
    }
  }
  let timeIndex = new Date(minimumTimetamp.getTime());

  while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
    tableHead.push(moment(timeIndex).format("DD MMM YYYY"));
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }
  const rows = [tableHead];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let countsCSV = [concatRepos[i].reponame, "count"];
    let uniquesCSV = [concatRepos[i].reponame, "unique"];

    const limitTimestamp = new Date(concatRepos[i].clones.data[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {
      countsCSV.push(0);
      uniquesCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const counts = concatRepos[i].clones.data.map(d => d.count);
    const uniques = concatRepos[i].clones.data.map(d => d.uniques);

    countsCSV = countsCSV.concat(counts);
    uniquesCSV = uniquesCSV.concat(uniques);
    rows.push(countsCSV);
    rows.push(uniquesCSV);
  }
  return rows;
}

function forksCsv(concatRepos) {
  let minimumTimetamp = new Date();
  minimumTimetamp.setUTCHours(0, 0, 0, 0);
  const maximumTimetamp = new Date();
  maximumTimetamp.setUTCHours(0, 0, 0, 0);

  const tableHead = ["reponame", "type"];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let firstRepoTimestamp = new Date(concatRepos[i].forks.data[0].timestamp);
    if (firstRepoTimestamp < minimumTimetamp) {
      minimumTimetamp = firstRepoTimestamp;
    }
  }
  let timeIndex = new Date(minimumTimetamp.getTime());

  while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
    tableHead.push(moment(timeIndex).format("DD MMM YYYY"));
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }
  const rows = [tableHead];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let countsCSV = [concatRepos[i].reponame, "count"];

    const limitTimestamp = new Date(concatRepos[i].forks.data[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {
      countsCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const counts = concatRepos[i].forks.data.map(d => d.count);

    countsCSV = countsCSV.concat(counts);
    rows.push(countsCSV);
  }
  return rows;
}

function createDailyCsv(concatRepos) {
  /* CSV containing views, clones and forks */
  const viewsTable = viewsCsv(concatRepos);
  const clonesTable = clonesCsv(concatRepos);
  const forksTable = forksCsv(concatRepos);
  const trafficCSV = viewsTable.concat(clonesTable).concat(forksTable);

  return trafficCSV;
}

function downloadCsvFile(rows) {
  const sheets = [];
  let currentSheet = -1;

  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].length <= 2) {
      sheets[++currentSheet] = {
        data: [],
        name: rows[i][0]
      };
    } else {
      sheets[currentSheet].data.push(rows[i]);
    }
  }

  const wb = XLSX.utils.book_new();
  sheets.forEach(s => {
    const ws = XLSX.utils.json_to_sheet(s.data, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, s.name);
  });

  XLSX.writeFile(wb, "repoTraffic.xlsx");
}

function downlaodDaily({ userRepos, sharedRepos }) {
  const concatRepos = [...userRepos, ...sharedRepos];
  const rows = createDailyCsv(concatRepos);

  downloadCsvFile(rows);
}

function reduceToMonthly(rows) {
  function reducer(total, currentValue, currentIndex) {
    if (currentIndex > 1) {
      if (searchDate(total, currentValue) === false) {
        total.push(currentValue);
      }
    }
    return total;
  }

  const reducerHof = th => (total, currentValue, currentIndex) => {
    if (currentIndex > 1) {
      let acc = total.pop();

      if (
        currentIndex === 2 ||
        compareDate(th[currentIndex], th[currentIndex - 1]) === false
      ) {
        total.push(acc);
        acc = [th[currentIndex], 0];
      }

      acc[1] += currentValue;
      total.push(acc);
    }

    return total;
  };

  let rowsMapReduced = rows.map((element, index) => {
    if (index === 0) {
      let months = element.reduce(reducer, [element[0], element[1]]);
      months = months.map((innerE, innerI) => {
        if (innerI > 1) {
          console.log(innerE);
          return moment(innerE).format("MMM YYYY");
        }
        return innerE;
      });

      return months;
    } else {
      let reducedCounts = element.reduce(reducerHof(rows[0]), [
        element[0],
        element[1]
      ]);

      reducedCounts = reducedCounts.map((innerE, innerI) => {
        if (innerI > 1) {
          return innerE[1];
        }

        return innerE;
      });
      return reducedCounts;
    }
  });

  return rowsMapReduced;
}

function downlaodMonthly({ userRepos, sharedRepos }) {
  const concatRepos = [...userRepos, ...sharedRepos];

  const viewsTable = viewsCsv(concatRepos);
  const reducedViewsTable = [["views"]].concat(reduceToMonthly(viewsTable));
  const clonesTable = clonesCsv(concatRepos);
  const reducedClonesTable = [["clones"]].concat(reduceToMonthly(clonesTable));
  const forksTable = forksCsv(concatRepos);
  const reducedForksTable = [["forks"]].concat(reduceToMonthly(forksTable));

  const trafficCSV = reducedViewsTable
    .concat(reducedClonesTable)
    .concat(reducedForksTable);

  downloadCsvFile(trafficCSV);
}

function DownloadButton() {
  const [downloadSelectOpen, setDownloadSelectOpen] = React.useState(false);
  const { repos } = React.useContext(DataContext);

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
          onChange={e => {
            switch (e.target.value) {
              case "monthly":
                downlaodMonthly(repos);
                break;
              case "daily":
                downlaodDaily(repos);
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
    </div>
  );
}

export default DownloadButton;
