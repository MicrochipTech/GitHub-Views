import React from "react";
import { Card, Typography } from "@material-ui/core";

function CardsList({ data }) {
  return (
    <div style={{ display: "flex" }}>
      {data.map((i) => (
        <Card className="cardsList">
          <Typography>
            {i.title}: {i.text}
          </Typography>
        </Card>
      ))}
    </div>
  );
}

export default CardsList;
