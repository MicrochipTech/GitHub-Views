import restify from "express-restify-mongoose";
import { Router } from "express";
import RepoModel from "../../models/Repository";

const restRouter = Router();

const dontAllow = (_req, res, _next) => res.status(401).send("Unauthorized");

restify.serve(restRouter, RepoModel, {
  preCreate: dontAllow,
  preDelete: dontAllow,
});

export default restRouter;
