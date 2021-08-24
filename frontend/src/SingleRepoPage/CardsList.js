import React from "react";
import { Card, Typography } from "@material-ui/core";

const CardsList = ({ data }) => (
  <div style={{ display: "flex" }}>
    {data.map((i) => (
      <Card className="cardsList">
        <Typography align="center">{i.title}</Typography>
        <Typography align="center">{i.text}</Typography>
      </Card>
    ))}
  </div>
);

export default CardsList;
