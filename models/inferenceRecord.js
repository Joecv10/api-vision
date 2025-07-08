// models/inferenceRecord.js
const { Schema, model } = require("mongoose");

const DetectionSchema = new Schema(
  {
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    bbox: { type: [Number], required: true },
  },
  { _id: false }
);

const CountSchema = new Schema(
  {
    label: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

const WeightByTypeSchema = new Schema(
  {
    label: { type: String, required: true },
    count: { type: Number, required: true },
    averageWeight: { type: Number, required: true },
    totalWeight: { type: Number, required: true },
  },
  { _id: false }
);

const InferenceRecordSchema = new Schema(
  {
    originalImageId: { type: Schema.Types.ObjectId, required: true },
    annotatedImageId: { type: Schema.Types.ObjectId, required: true },
    detections: { type: [DetectionSchema], required: true },
    counts: { type: [CountSchema], required: true },
    weightByType: { type: [WeightByTypeSchema], required: true },
    totalWeight: { type: Number, required: true },
    weightUnit: { type: String, default: "g" },
    message: { type: String },
  },
  {
    timestamps: true,
  }
);

// Índices útiles
InferenceRecordSchema.index({ createdAt: -1 });
InferenceRecordSchema.index({ "detections.label": 1 });
InferenceRecordSchema.index({ totalWeight: 1 });

module.exports = model("InferenceRecord", InferenceRecordSchema);
