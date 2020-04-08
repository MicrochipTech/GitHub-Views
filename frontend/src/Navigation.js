import React from "react";
import { AuthContext } from "./Auth";
import { DataContext } from "./Data";
import DownloadButton from "./DownloadButton";

const PAGES = [
  { title: "My Repositories", key: "userRepos" },
  { title: "Shared Repositories", key: "sharedRepos" },
  { title: "Aggregate Charts", key: "aggregateCharts" },
  { title: "Zombie Repositories", key: "zombies" }
];

function Navigation({ setPage }) {
  const { user } = React.useContext(AuthContext);
  const { syncRepos } = React.useContext(DataContext);

  return (
    <nav>
      <ul>
        {PAGES.filter((p, idx) => {
          if (idx === 0) {
            return user.githubId != null;
          }
          return true;
        }).map(p => (
          <li key={p.key} onClick={_ => setPage(p)}>
            {p.title}
          </li>
        ))}
        <hr />
        <DownloadButton />
        {user.githubId && <li onClick={syncRepos}>Sync Repositories</li>}
      </ul>
    </nav>
  );
}

export { Navigation, PAGES };
