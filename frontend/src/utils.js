import moment from "moment";
import XLSX from "xlsx";

function add0s(series) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);

  if (series.length !== 0) {
    const first = new Date(series[0].timestamp);
    const last = new Date(series[series.length - 1].timestamp);

    if (first.getTime() < firstTimestamp.getTime()) {
      firstTimestamp = first;
    }

    if (last.getTime() > lastTimestamp.getTime()) {
      lastTimestamp = last;
    }
  }

  let index = 0;
  const timeIndex = firstTimestamp;

  while (timeIndex.getTime() <= lastTimestamp.getTime()) {
    if (series[index] === undefined) {
      series.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0,
      });
    } else {
      const currentTimestamp = new Date(series[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        series.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0,
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return series;
}

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

function dailyToMonthlyReducer(dailyData) {
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

  let rowsMapReduced = dailyData.map((element, index) => {
    if (index === 0) {
      return element;
    } else if (index === 1) {
      let months = element.reduce(reducer, [element[0], element[1]]);
      months = months.map((innerE, innerI) => {
        if (innerI > 1) {
          return moment(innerE).format("MMM YYYY");
        }
        return innerE;
      });

      return months;
    } else {
      let reducedCounts = element.reduce(reducerHof(dailyData[1]), [
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

function downloadExcelFile(rows, name = "repoTraffic.xlsx") {
  const sheets = [];
  let currentSheet = -1;

  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].length <= 2) {
      sheets[++currentSheet] = {
        data: [],
        name: rows[i][0],
      };
    } else {
      sheets[currentSheet].data.push(rows[i]);
    }
  }

  const wb = XLSX.utils.book_new();
  sheets.forEach((s) => {
    const ws = XLSX.utils.json_to_sheet(s.data, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, s.name);
  });

  XLSX.writeFile(wb, name);
}

function prepareRepo(r) {
  return {
    ...r,
    views: { ...r.views, data: add0s(r.views.data) },
    clones: { ...r.clones, data: add0s(r.clones.data) },
    forks: { ...r.forks, data: add0s(r.forks.data) },
  };
}

function prepareData(data) {
  data.zombieRepos = data.userRepos
    .filter((r) => r.not_found)
    .map(prepareRepo)
    .concat(data.sharedRepos.filter((r) => r.not_found).map(prepareRepo));

  data.userRepos = data.userRepos.filter((r) => !r.not_found).map(prepareRepo);

  data.sharedRepos = data.sharedRepos
    .filter((r) => !r.not_found)
    .map(prepareRepo);

  return data;
}

export {
  add0s,
  compareDate,
  searchDate,
  dailyToMonthlyReducer,
  downloadExcelFile,
  prepareRepo,
  prepareData,
};
