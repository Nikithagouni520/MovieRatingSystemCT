import express from "express";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Review from "../models/Review.js";

const router = express.Router();

const movieWithStatsPipeline = (match = {}) => [
  { $match: match },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "movie",
      as: "reviews"
    }
  },
  {
    $addFields: {
      averageRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
      reviewCount: { $size: "$reviews" }
    }
  },
  {
    $project: {
      reviews: 0,
      __v: 0
    }
  }
];

router.get("/", async (req, res, next) => {
  try {
    const { search = "", genre = "All", sort = "rating" } = req.query;
    const match = {};

    if (genre !== "All") {
      match.genre = genre;
    }

    if (search.trim()) {
      match.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { director: { $regex: search.trim(), $options: "i" } },
        { synopsis: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const sortMap = {
      rating: { averageRating: -1, reviewCount: -1 },
      newest: { year: -1 },
      title: { title: 1 },
      reviews: { reviewCount: -1 }
    };

    const movies = await Movie.aggregate([
      ...movieWithStatsPipeline(match),
      { $sort: sortMap[sort] || sortMap.rating }
    ]);

    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get("/genres", async (_req, res, next) => {
  try {
    const genres = await Movie.distinct("genre");
    res.json(["All", ...genres.sort()]);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movieId = new mongoose.Types.ObjectId(req.params.id);
    const [movie] = await Movie.aggregate(movieWithStatsPipeline({ _id: movieId }));
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const reviews = await Review.find({ movie: movieId }).sort({ createdAt: -1 });
    res.json({ ...movie, reviews });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

router.post("/:id/reviews", async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const review = await Review.create({
      movie: movie._id,
      reviewer: req.body.reviewer,
      rating: Number(req.body.rating),
      comment: req.body.comment
    });

    res.status(201).json(review);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

export default router;
