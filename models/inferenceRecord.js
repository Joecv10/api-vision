const { Schema, model } = require("mongoose");

const DetectionSchema = new Schema(
  {
    label: String,
    confidence: Number,
    bbox: [Number],
  },
  { _id: false }
);

const CountSchema = new Schema(
  {
    label: String,
    count: Number,
  },
  { _id: false }
);

const WeightByTypeSchema = new Schema(
  {
    label: String,
    count: Number,
    averageWeight: Number,
    totalWeight: Number,
  },
  { _id: false }
);

const InferenceRecordSchema = new Schema({
  originalImageId: Schema.Types.ObjectId, // GridFS File ID
  annotatedImageId: Schema.Types.ObjectId, // GridFS File ID
  detections: [DetectionSchema],
  counts: [CountSchema],
  weightByType: [WeightByTypeSchema],
  totalWeight: Number,
  weightUnit: { type: String, default: "g" },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("InferenceRecord", InferenceRecordSchema);
