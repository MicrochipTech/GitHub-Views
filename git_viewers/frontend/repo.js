import { addRepoListener } from "./listeners";

function addRepoInToggleList(repo) {
  const toggleDiv = document.createElement("div");
  toggleDiv.className = "custom-control custom-switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "custom-control-input";
  input.id = repo.reponame;
  input.addEventListener("click", addRepoListener);

  const label = document.createElement("label");
  label.className = "custom-control-label";
  label.setAttribute("for", `${repo.reponame}`);
  label.innerText = repo.reponame;

  toggleDiv.appendChild(input);
  toggleDiv.appendChild(label);
  document.getElementById("fullRepoNames").appendChild(toggleDiv);
}

function prepareRepo(repo) {
  let firstTimestamp = new Date();
  firstTimestamp.setUTCHours(0, 0, 0, 0);
  firstTimestamp.setUTCDate(firstTimestamp.getUTCDate() - 14);

  let lastTimestamp = new Date();
  lastTimestamp.setUTCHours(0, 0, 0, 0);
  lastTimestamp.setUTCDate(lastTimestamp.getUTCDate() - 1);

  if (repo.views.length !== 0) {
    const first = new Date(repo.views[0].timestamp);
    const last = new Date(repo.views[repo.views.length - 1].timestamp);

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
    if (repo.views[index] === undefined) {
      repo.views.push({
        timestamp: timeIndex.toISOString(),
        count: 0,
        uniques: 0
      });
    } else {
      const currentTimestamp = new Date(repo.views[index].timestamp);

      if (timeIndex.getTime() < currentTimestamp.getTime()) {
        repo.views.splice(index, 0, {
          timestamp: timeIndex.toISOString(),
          count: 0,
          uniques: 0
        });
      }
    }

    index += 1;
    timeIndex.setUTCDate(timeIndex.getUTCDate() + 1);
  }

  return repo;
}

window.shareRepository = () => {
  const username = document.getElementById("share-with").value;

  $.ajax({
    url: "/repo/share",
    type: "POST",
    dataType: "json",
    data: `name=get_username&repoId=${window.repoIdToShare}&username=${username}`
  });
};

function getRepoFromData(reponame) {
  const fromUserRepo = data.userRepos.filter(
    repo => repo.reponame === reponame
  );
  const fromSharedRepo = data.sharedRepos.filter(
    repo => repo.reponame === reponame
  );

  if (fromUserRepo.length !== 0) {
    return fromUserRepo[0];
  }

  if (fromSharedRepo.length !== 0) {
    return fromSharedRepo[0];
  }
  return undefined;
}

export { addRepoInToggleList, prepareRepo, getRepoFromData };
