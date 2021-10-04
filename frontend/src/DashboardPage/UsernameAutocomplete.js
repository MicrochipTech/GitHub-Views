import React from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";

export default function UserAutocomplete({ onChange }) {
  const [options, setOptions] = React.useState([]);
  const [q, setQ] = React.useState();

  return (
    <div style={{ width: "100%" }}>
      <Autocomplete
        id="free-solo-demo"
        freeSolo
        options={options}
        onInputChange={(e, val) => {
          onChange(val);
          if (e.target.value && e.target.value.length > 0) {
            setQ(e.target.value);
            fetch(`/api/user/startsWith?q=${e.target.value}`, {
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
              __html: option.replace(q, `<b>${q}</b>`)
            }}
          />
        )}
        renderInput={params => (
          <TextField
            {...params}
            label="Username"
            margin="normal"
            variant="outlined"
            fullWidth
          />
        )}
      />
    </div>
  );
}
