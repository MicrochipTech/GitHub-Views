import React from "react";
import moment from "moment";
import LineChart from "./LineChart";

function generateRandomColour(total, idx) {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;
}

function Repository({ index, style, data }) {
  const { page, repos, visibleRepos } = data;
  const d = visibleRepos[index];

  let dataD = [];
  let labels = [];
  let plotData = null;
  if (page === "aggregateCharts") {
    dataD = d.repo_list.map(
      r =>
        repos["userRepos"]
          .concat(repos["sharedRepos"])
          .filter(m => m._id === r)[0]
    );

    const maximumTimetamp = new Date();
    maximumTimetamp.setUTCHours(0, 0, 0, 0);
    maximumTimetamp.setUTCDate(maximumTimetamp.getUTCDate() - 1);

    let minimumTimetamp = new Date();
    minimumTimetamp.setUTCHours(0, 0, 0, 0);
    minimumTimetamp.setUTCDate(minimumTimetamp.getUTCDate() - 1);

    minimumTimetamp = dataD.reduce((acc, repo) => {
      const repoDate = new Date(repo.views[0].timestamp);

      if (repoDate < acc) {
        acc = repoDate;
      }
      return acc;
    }, minimumTimetamp);

    let timeIndex = new Date(minimumTimetamp.getTime());

    while (timeIndex.getTime() <= maximumTimetamp.getTime()) {
      labels.push(moment(timeIndex).format("DD MMM YYYY"));

      timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
    }

    plotData = {
      chartname: "chart",
      timestamp: labels,
      data: dataD.reduce((acc, e, idx) => {
        const repo = e;
        let views = [];
        let uniques = [];

        const limitTimestamp = new Date(repo.views[0].timestamp);
        timeIndex = new Date(minimumTimetamp.getTime());

        while (timeIndex.getTime() < limitTimestamp.getTime()) {
          views.push(0);
          uniques.push(0);

          timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
        }

        views = views.concat(repo.views.map(h => h.count));
        uniques = uniques.concat(repo.views.map(h => h.uniques));

        acc.push({
          label: `${repo.reponame} - Views`,
          dataset: views,
          color: generateRandomColour(),
          _id: e._id
        });
        acc.push({
          label: `${repo.reponame} - Unique Views`,
          dataset: uniques,
          _id: e._id,
          color: generateRandomColour()
        });
        return acc;
      }, [])
    };
  } else {
    dataD.push(d);

    plotData = {
      chartname: d.reponame,
      _id: d._id,
      timestamp: d.views.map(h => moment(h.timestamp).format("DD MMM YYYY")),
      data: dataD.reduce((acc, e) => {
        const repo = e;
        const views = repo.views.map(h => h.count);
        const uniques = repo.views.map(h => h.uniques);
        acc.push({
          label: `Views`,
          dataset: views,
          color: "#603A8B"
        });
        acc.push({
          label: `Unique Views`,
          dataset: uniques,
          color: "#FDCB00"
        });
        return acc;
      }, [])
    };
  }

  return (
    <LineChart key={d._id} aggregateId={d._id} data={plotData} type={page} />
  );
}

export default Repository;
