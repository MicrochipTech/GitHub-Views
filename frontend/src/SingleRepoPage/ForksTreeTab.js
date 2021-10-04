import React from "react";
import axios from "axios";
import { Grid, CircularProgress } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

function ForksTreeItem({ item }) {
  return (
    <TreeItem nodeId={item.github_repo_id} label={item.reponame}>
      {item.children.map((i) => (
        <ForksTreeItem key={i.github_repo_id} item={i} />
      ))}
    </TreeItem>
  );
}

function ForksTreeTab({ repo }) {
  const [treeData, setTreeData] = React.useState([]);
  const [
    isLayeFetchingInProgress,
    setIsLazzyFetchingInProgress,
  ] = React.useState(false);

  React.useEffect(() => {
    if (repo.forks.tree_updated) {
      setTreeData(repo.forks.children);
    } else {
      axios
        .post("/api/repo/updateForksTree", {
          repo_id: repo._id,
        })
        .then((res) => {
          console.log(res);
          setTreeData(res.data.treeData);
          setIsLazzyFetchingInProgress(false);
        });
      setIsLazzyFetchingInProgress(true);
    }
  }, []);

  if (isLayeFetchingInProgress) {
    return <CircularProgress />;
  }

  return (
    <Grid item xs={12}>
      {!isLayeFetchingInProgress &&
        treeData.length === 0 &&
        "This repository has no forks yet."}
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {treeData.map((i) => (
          <ForksTreeItem key={i.github_repo_id} item={i} />
        ))}
      </TreeView>
    </Grid>
  );
}

export default ForksTreeTab;
