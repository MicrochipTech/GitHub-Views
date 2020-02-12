import React from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";

export default function FreeSolo() {
  const [options, setOptions] = React.useState([]);

  return (
    <div style={{ width: 300 }}>
      <Autocomplete
        id="free-solo-demo"
        freeSolo
        options={options}
        renderOption={option => <Typography noWrap>{option}</Typography>}
        renderInput={params => (
          <TextField
            {...params}
            label="freeSolo"
            margin="normal"
            variant="outlined"
            fullWidth
            onChange={e => {
              if (e.target.value.length > 1) {
                fetch(`/api/user/startsWith?q=${e.target.value}`, {
                  method: "GET"
                })
                  .then(r => r.json())
                  .then(r => setOptions(r));
              } else {
                setOptions([]);
              }
            }}
          />
        )}
      />
    </div>
  );
}
