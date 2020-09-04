import React from "react";
import { Select, MenuItem } from "@material-ui/core";
import moment from "moment";
import { compareDate, searchDate, downloadExcelFile } from "../utils";
import DownloadFileConfigure from "./DownloadFileConfigure";

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

    const views = concatRepos[i].views.map((h) => h.count);
    const uniques = concatRepos[i].views.map((h) => h.uniques);

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

    const counts = concatRepos[i].clones.data.map((d) => d.count);
    const uniques = concatRepos[i].clones.data.map((d) => d.uniques);

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
    if (concatRepos[i].forks.data.length === 0) {
      console.log(concatRepos[i].reponame);
      continue;
    }
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
    if (concatRepos[i].forks.data.length === 0) {
      console.log(concatRepos[i].reponame);
      continue;
    }

    let countsCSV = [concatRepos[i].reponame, "count"];

    const limitTimestamp = new Date(concatRepos[i].forks.data[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {
      countsCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const counts = concatRepos[i].forks.data.map((d) => d.count);

    countsCSV = countsCSV.concat(counts);
    rows.push(countsCSV);
  }
  return rows;
}

function downlaodDaily(concatRepos, sheets) {
  const sheetsDict = {};
  sheets.forEach((s) => (sheetsDict[s.name] = s.checked));

  let rows = [];

  if (sheetsDict["Views"]) {
    const viewsTable = viewsCsv(concatRepos);
    rows = rows.concat([["Views"]]).concat(viewsTable);
  }

  if (sheetsDict["Clones"]) {
    const clonesTable = clonesCsv(concatRepos);
    rows = rows.concat([["Clones"]]).concat(clonesTable);
  }

  if (sheetsDict["Forks"]) {
    const forksTable = forksCsv(concatRepos);
    rows = rows.concat([["Forks"]]).concat(forksTable);
  }

  console.log("rows: ", rows);

  downloadExcelFile(rows);
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

  const reducerHof = (th) => (total, currentValue, currentIndex) => {
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
        element[1],
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

function downlaodMonthly(concatRepos, sheets) {
  const sheetsDict = {};
  sheets.forEach((s) => (sheetsDict[s.name] = s.checked));

  let trafficCSV = [];

  if (sheetsDict["Views"]) {
    const viewsTable = viewsCsv(concatRepos);
    const reducedViewsTable = [["Views"]].concat(reduceToMonthly(viewsTable));
    trafficCSV = trafficCSV.concat(reducedViewsTable);
  }

  if (sheetsDict["Clones"]) {
    const clonesTable = clonesCsv(concatRepos);
    const reducedClonesTable = [["Clones"]].concat(
      reduceToMonthly(clonesTable)
    );
    trafficCSV = trafficCSV.concat(reducedClonesTable);
  }

  if (sheetsDict["Forks"]) {
    const forksTable = forksCsv(concatRepos);
    const reducedForksTable = [["Forks"]].concat(reduceToMonthly(forksTable));
    trafficCSV = trafficCSV.concat(reducedForksTable);
  }

  console.log(trafficCSV);
  downloadExcelFile(trafficCSV);
}

function DownloadButton() {
  const [downloadSelectOpen, setDownloadSelectOpen] = React.useState(false);

  const handleClose = () => {
    setDownloadSelectOpen(false);
  };

  const handleOpen = () => {
    setDownloadSelectOpen(true);
  };

  const [isModalOpened, setIsModalOpened] = React.useState(false);
  const [viewToDownload, setViewToDownload] = React.useState();

  return (
    <div>
      {isModalOpened && (
        <DownloadFileConfigure
          open={isModalOpened}
          onDownload={(selectedRepos, sheets) => {
            switch (viewToDownload) {
              case "monthly":
                downlaodMonthly(selectedRepos, sheets);
                break;
              case "daily":
                downlaodDaily(selectedRepos, sheets);
                break;
              default:
                throw Error("Unknown downlaod type requested.");
            }
          }}
          onClose={() => {
            setIsModalOpened(false);
          }}
        />
      )}
      <li onClick={handleOpen}>Download as Excel</li>
      {downloadSelectOpen && (
        <Select
          open={downloadSelectOpen}
          onClose={handleClose}
          onOpen={handleOpen}
          onChange={(e) => {
            setIsModalOpened(true);
            setViewToDownload(e.target.value);
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
