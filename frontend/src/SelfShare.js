import React from "react";
import { AuthContext } from "./Auth";
import { DataContext } from "./Data";
import { Button, Typography, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

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
        getOptionLabel={o => o.reponame}
        onChange={(e, value, reason) => setSelected(value)}
        onInputChange={(e, val) => {
          if (e.target.value && e.target.value.length > 0) {
            setQ(e.target.value);
            fetch(`/api/repo/nameContains?q=${e.target.value}`, {
              method: "GET"
            })
              .then(r => r.json())
              .then(r => setOptions(r));
          } else {
            setOptions([]);
          }
        }}
        renderOption={option => (
          <Typography
            noWrap
            dangerouslySetInnerHTML={{
              __html: option.reponame.replace(q, `<b>${q}</b>`)
            }}
          />
        )}
        renderInput={params => (
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
          const res = await fetch("/api/repo/share", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              repoId: selected._id,
              username: user.username
            })
          });
          const resData = await res.json();
          addSharedRepo(resData.repo);
          if (onRepoAdded) onRepoAdded();
        }}
      >
        Add
      </Button>
    </div>
  );
}

export default SelfShare;
