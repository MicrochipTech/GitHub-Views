import React from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../Auth";
import { DataContext } from "../Data";
import DownloadButton from "./DownloadButton";

function Navigation() {
  const PAGES = [
    { title: "My Repositories", key: "userRepos" },
    { title: "Shared Repositories", key: "sharedRepos" },
    { title: "Aggregate Charts", key: "aggregateCharts" },
  ];

  const history = useHistory();
  const { user } = React.useContext(AuthContext);
  const { syncRepos } = React.useContext(DataContext);

  if (user.msft_oid) {
    PAGES.unshift({
      title: `${process.env.REACT_APP_AAD_ORGANIZATION_NAME} Repos`,
      key: "mchpRepos",
    });
  }

  return (
    <nav>
      <ul>
        {PAGES.filter((p, idx) => {
          if (p.key === "userRepos") {
            return user.githubId != null;
          }
          return true;
        }).map((p) => (
          <li
            data-testid={p.key}
            key={p.key}
            onClick={(_) => history.push(`/dashboard/${p.key}`)}
          >
            {p.title}
          </li>
        ))}
        <hr />
        <DownloadButton />
        {user.githubId && (
          <li data-testid="syncBtn" onClick={syncRepos}>
            Sync Repositories
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
