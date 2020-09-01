import React from "react";
import { Button, Typography, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { AuthContext } from "../Auth";
import { DataContext } from "../Data";

function SelfShare({ onRepoAdded }) {
  const { user } = React.useContext(AuthContext);
  const { addSharedRepo } = React.useContext(DataContext);
  const [options, setOptions] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [q, setQ] = React.useState();

  return (
    <div className="nothing">
      <p style={{ fontSize: "18px" }}>
        Type a repository name and if it is beeing tracked by this tool you will
        be able to see it`s data.
      </p>
      <Autocomplete
        id="free-solo-demo"
        freeSolo
        options={options}
        getOptionLabel={(o) => o.reponame}
        onChange={(e, value, reason) => setSelected(value)}
        onInputChange={(e, val) => {
          if (e.target.value && e.target.value.length > 0) {
            setQ(e.target.value);
            fetch(`/api/repo/nameContains?q=${e.target.value}`, {
              method: "GET",
            })
              .then((r) => r.json())
              .then((r) => setOptions(r));
          } else {
            setOptions([]);
          }
        }}
        renderOption={(option) => (
          <Typography
            noWrap
            dangerouslySetInnerHTML={{
              __html: option.reponame.replace(q, `<b>${q}</b>`),
            }}
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Repository"
            margin="normal"
            variant="outlined"
            fullWidth
          />
        )}
      />
      <Button
        onClick={async () => {
          if (selected) {
            const res = await fetch("/api/repo/share", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                repoId: selected._id,
                username: user.username,
              }),
            });
            const resData = await res.json();
            console.log("resData: ", resData);
            addSharedRepo(resData.repo);
            if (onRepoAdded) onRepoAdded();
          } else {
            alert("Please choose a valid repo.");
          }
        }}
      >
        Add
      </Button>
    </div>
  );
}

export default SelfShare;
