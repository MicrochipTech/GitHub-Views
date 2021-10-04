
import { Document, Schema, model } from 'mongoose';

export interface Chart extends Document {
  user: Schema.Types.ObjectId,
  repo_list: Schema.Types.ObjectId[]
}

const aggregateChartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  repo_list: [{ type: Schema.Types.ObjectId, ref: "Repository" }]
});

export default model<Chart>("Chart", aggregateChartSchema);
