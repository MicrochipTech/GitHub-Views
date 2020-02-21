import React from "react";
import { DataContext } from "./Data";
import { Select, MenuItem } from "@material-ui/core";
import moment from "moment";

function compareDate(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  ) {
    return true;
  }

  return false;
}

function searchDate(dateArr, d1) {
  for (let index = 2; index < dateArr.length; ++index) {
    if (compareDate(dateArr[index], d1)) return true;
  }

  return false;
}

function createDailyCsv(concatRepos) {
  let minimumTimetamp = new Date();
  minimumTimetamp.setUTCHours(0, 0, 0, 0);
  minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);
  const maximumTimetamp = new Date();
  maximumTimetamp.setUTCHours(0, 0, 0, 0);
  maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

  const tableHead = ["reponame", "type"];

  for (let i = 0; i < concatRepos.length; i += 1) {
    let firstRepoTimestamp = new Date(concatRepos[i].views[0].timestamp);
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
    let viewsCSV = [concatRepos[i].reponame, "views"];
    let uniquesCSV = [concatRepos[i].reponame, "uniques"];

    const limitTimestamp = new Date(concatRepos[i].views[0].timestamp);
    timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() < limitTimestamp.getTime()) {
      viewsCSV.push(0);
      uniquesCSV.push(0);

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    const views = concatRepos[i].views.map(h => h.count);
    const uniques = concatRepos[i].views.map(h => h.uniques);

    viewsCSV = viewsCSV.concat(views);
    uniquesCSV = uniquesCSV.concat(uniques);
    rows.push(viewsCSV);
    rows.push(uniquesCSV);
  }
  return rows;
}

function downloadCsvFile(rows) {
  let csvContent =
    "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "repoTraffic.csv");
  document.body.appendChild(link);

  link.click();
}

function downlaodDaily({ userRepos, sharedRepos }) {
  const concatRepos = [...userRepos, ...sharedRepos];
  const rows = createDailyCsv(concatRepos);

  downloadCsvFile(rows);
}

function downlaodMonthly({ userRepos, sharedRepos }) {
  const concatRepos = [...userRepos, ...sharedRepos];
  const rows = createDailyCsv(concatRepos);

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
        //console.log(th[currentIndex]);
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

  downloadCsvFile(rowsMapReduced);
  console.log(rowsMapReduced);
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
