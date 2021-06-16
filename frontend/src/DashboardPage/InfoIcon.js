import React, { useContext } from "react";
import { Box, Popover } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { DataContext } from "../Data";

function MInfoIcon() {
    const { names } = useContext(DataContext);

    const [infoIcon, setInfoIcon] = React.useState(null);

    let counterSplit = {};
   
    names.forEach((r) => {
        const org = r.reponame.split("/")[0];
        if (counterSplit[org] === undefined) {
            counterSplit[org] = 0;
        }
        counterSplit[org] += 1;
    });

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <InfoIcon
                onClick={(e) => setInfoIcon(e.currentTarget)}
                style={{ cursor: "pointer" }}
            />
            <Popover
                anchorEl={infoIcon}
                open={infoIcon !== null}
                onClose={() => setInfoIcon(null)}
                anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
                }}
                transformOrigin={{
                vertical: "top",
                horizontal: "center",
                }}
            >
                <Box p="10px">
                {Object.entries(counterSplit).map(([key, value]) => (
                    <div>
                    {value} - {key}
                    </div>
                ))}
                </Box>
            </Popover>
            &nbsp;
            <span>{names.length} repos</span>
        </Box>
    )
}

export default MInfoIcon;