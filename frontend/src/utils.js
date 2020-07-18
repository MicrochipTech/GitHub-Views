function add0s(series) {
    let firstTimestamp = new Date();
    firstTimestamp.setUTCHours(0, 0, 0, 0);
    firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);
  
    let lastTimestamp = new Date();
    lastTimestamp.setUTCHours(0, 0, 0, 0);
    lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);
  
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

  export {
      add0s
  }