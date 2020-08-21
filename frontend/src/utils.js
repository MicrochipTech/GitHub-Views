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
        uniques: 0
      });
    } else {
      const currentTimestamp = new Date(series[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        series.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0
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
export { 
  add0s,
  compareDate,
  searchDate
 };
