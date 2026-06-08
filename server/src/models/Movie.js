import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    year: {
      type: Number,
      required: true,
      min: 1888,
      max: new Date().getFullYear() + 5
    },
    genre: {
      type: String,
      required: true,
      trim: true
    },
    director: {
      type: String,
      required: true,
      trim: true
    },
    runtime: {
      type: Number,
      required: true,
      min: 1
    },
    posterUrl: {
      type: String,
      required: true,
      trim: true
    },
    synopsis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

movieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movie"
});

export default mongoose.model("Movie", movieSchema);
