import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";
import Review from "./models/Review.js";

dotenv.config();

const movies = [
  {
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi",
    director: "Christopher Nolan",
    runtime: 169,
    featured: true,
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    synopsis: "A team of explorers travels through a wormhole in space in search of a new home for humanity."
  },
  {
    title: "La La Land",
    year: 2016,
    genre: "Musical",
    director: "Damien Chazelle",
    runtime: 128,
    featured: true,
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
    synopsis: "A jazz pianist and an aspiring actor fall in love while chasing difficult dreams in Los Angeles."
  },
  {
    title: "Parasite",
    year: 2019,
    genre: "Thriller",
    director: "Bong Joon Ho",
    runtime: 132,
    featured: true,
    posterUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
    synopsis: "A struggling family schemes its way into the lives of a wealthy household with startling consequences."
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    genre: "Animation",
    director: "Bob Persichetti",
    runtime: 117,
    posterUrl: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80",
    synopsis: "Miles Morales becomes Spider-Man and discovers a multiverse full of unexpected allies."
  },
  {
    title: "The Grand Budapest Hotel",
    year: 2014,
    genre: "Comedy",
    director: "Wes Anderson",
    runtime: 99,
    posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    synopsis: "A legendary concierge and his lobby boy are swept into a stylish caper between the wars."
  },
  {
    title: "Dune",
    year: 2021,
    genre: "Sci-Fi",
    director: "Denis Villeneuve",
    runtime: 155,
    posterUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    synopsis: "A gifted young heir travels to the desert planet Arrakis and steps into a dangerous destiny."
  }
];

const reviewTexts = [
  ["A gorgeous, thoughtful experience that still feels huge on rewatch.", 5],
  ["Strong craft and memorable scenes from start to finish.", 4],
  ["Easy to recommend, especially for movie night with friends.", 4]
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movie-rating-system";
  await mongoose.connect(mongoUri);
  await Review.deleteMany({});
  await Movie.deleteMany({});

  const created = await Movie.insertMany(movies);
  const reviews = created.flatMap((movie, index) =>
    reviewTexts.map(([comment, rating], reviewIndex) => ({
      movie: movie._id,
      reviewer: ["Avery Stone", "Mira Chen", "Noah Brooks"][reviewIndex],
      rating: Math.max(1, Math.min(5, rating - (index % 2 === 0 ? 0 : reviewIndex % 2))),
      comment
    }))
  );

  await Review.insertMany(reviews);
  await mongoose.disconnect();
  console.log(`Seeded ${created.length} movies and ${reviews.length} reviews.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
