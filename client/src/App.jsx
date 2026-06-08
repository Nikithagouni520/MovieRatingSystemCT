import { Film, Plus, Search, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { sampleMovies } from "./sampleData";

const initialMovieForm = {
  title: "",
  year: new Date().getFullYear(),
  genre: "",
  director: "",
  runtime: 120,
  posterUrl: "",
  synopsis: ""
};

const initialReviewForm = {
  reviewer: "",
  rating: 5,
  comment: ""
};

function Stars({ value, interactive = false, onChange }) {
  return (
    <div className="stars" aria-label={`${Number(value).toFixed(1)} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          className={star <= Math.round(value) ? "star active" : "star"}
          key={star}
          onClick={() => interactive && onChange(star)}
          type="button"
          disabled={!interactive}
          aria-label={`${star} star`}
        >
          <Star size={18} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

function App() {
  const [movies, setMovies] = useState(sampleMovies);
  const [genres, setGenres] = useState(["All", ...new Set(sampleMovies.map((movie) => movie.genre))]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("rating");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieForm, setMovieForm] = useState(initialMovieForm);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(false);

  const featured = useMemo(
    () => movies.find((movie) => movie.featured) || movies[0],
    [movies]
  );

  async function loadMovies() {
    setLoading(movies.length === 0);
    try {
      const [movieData, genreData] = await Promise.all([
        api.movies({ search: query, genre, sort }),
        api.genres()
      ]);
      setMovies(movieData);
      setGenres(genreData);
      setOffline(false);
    } catch (error) {
      const filtered = sampleMovies
        .filter((movie) => genre === "All" || movie.genre === genre)
        .filter((movie) =>
          [movie.title, movie.director, movie.synopsis].join(" ").toLowerCase().includes(query.toLowerCase())
        );
      setMovies(filtered);
      setGenres(["All", ...new Set(sampleMovies.map((movie) => movie.genre))]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadMovies, 180);
    return () => clearTimeout(timeout);
  }, [query, genre, sort]);

  async function addMovie(event) {
    event.preventDefault();
    try {
      const created = await api.createMovie(movieForm);
      setMovies((current) => [created, ...current]);
      setMovieForm(initialMovieForm);
      setShowMovieForm(false);
      setNotice("Movie added to the collection.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function addReview(event) {
    event.preventDefault();
    if (!selectedMovie) return;

    try {
      await api.review(selectedMovie._id, reviewForm);
      setReviewForm(initialReviewForm);
      setSelectedMovie(null);
      setNotice("Review published. Ratings refreshed.");
      loadMovies();
    } catch (error) {
      setNotice(offline ? "Start the API and MongoDB to save reviews." : error.message);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="heroBackdrop" style={{ backgroundImage: `url(${featured?.posterUrl || ""})` }} />
        <nav className="nav">
          <div className="brand">
            <span className="brandIcon"><Film size={22} /></span>
            <span>ReelRate</span>
          </div>
          <button className="primaryButton" onClick={() => setShowMovieForm(true)} type="button">
            <Plus size={18} />
            Add Movie
          </button>
        </nav>

        <div className="heroContent">
          <div>
            <div className="eyebrow"><Sparkles size={16} /> Curated community ratings</div>
            <h1>{featured?.title || "Movie Rating System"}</h1>
            <p>{featured?.synopsis || "Discover, rate, and review cinema with a clean MERN stack app."}</p>
            <div className="heroStats">
              <span><strong>{featured?.averageRating?.toFixed?.(1) || "0.0"}</strong> average</span>
              <span><strong>{featured?.reviewCount || 0}</strong> reviews</span>
              <span><strong>{featured?.year || "2026"}</strong> release</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        {notice && (
          <button className="notice" type="button" onClick={() => setNotice("")}>
            {notice}
            <X size={16} />
          </button>
        )}

        <div className="toolbar">
          <label className="searchBox">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies, directors, stories" />
          </label>
          <label className="selectBox">
            <SlidersHorizontal size={18} />
            <select value={genre} onChange={(event) => setGenre(event.target.value)}>
              {genres.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <select className="sortSelect" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
            <option value="title">A to Z</option>
            <option value="reviews">Most reviewed</option>
          </select>
        </div>

        {offline && <p className="offline">Demo data is showing because the API or MongoDB is not running.</p>}

        <div className="movieGrid">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <div className="movieCard skeleton" key={index} />)
          ) : (
            movies.map((movie) => (
              <article className="movieCard" key={movie._id}>
                <img src={movie.posterUrl} alt="" />
                <div className="movieBody">
                  <div className="movieMeta">
                    <span>{movie.genre}</span>
                    <span>{movie.runtime} min</span>
                  </div>
                  <h2>{movie.title}</h2>
                  <p>{movie.synopsis}</p>
                  <div className="ratingRow">
                    <Stars value={movie.averageRating || 0} />
                    <strong>{Number(movie.averageRating || 0).toFixed(1)}</strong>
                    <span>{movie.reviewCount || 0} reviews</span>
                  </div>
                  <div className="movieFooter">
                    <span>{movie.director} · {movie.year}</span>
                    <button type="button" onClick={() => setSelectedMovie(movie)}>Rate</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {showMovieForm && (
        <div className="modalLayer" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={addMovie}>
            <button className="iconButton" type="button" onClick={() => setShowMovieForm(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h2>Add a Movie</h2>
            <div className="formGrid">
              {["title", "genre", "director", "posterUrl"].map((field) => (
                <label key={field}>
                  <span>{field === "posterUrl" ? "Poster URL" : field}</span>
                  <input required value={movieForm[field]} onChange={(event) => setMovieForm({ ...movieForm, [field]: event.target.value })} />
                </label>
              ))}
              <label>
                <span>Year</span>
                <input required type="number" value={movieForm.year} onChange={(event) => setMovieForm({ ...movieForm, year: Number(event.target.value) })} />
              </label>
              <label>
                <span>Runtime</span>
                <input required type="number" value={movieForm.runtime} onChange={(event) => setMovieForm({ ...movieForm, runtime: Number(event.target.value) })} />
              </label>
            </div>
            <label>
              <span>Synopsis</span>
              <textarea required value={movieForm.synopsis} onChange={(event) => setMovieForm({ ...movieForm, synopsis: event.target.value })} />
            </label>
            <button className="primaryButton wide" type="submit">Save Movie</button>
          </form>
        </div>
      )}

      {selectedMovie && (
        <div className="modalLayer" role="dialog" aria-modal="true">
          <form className="modal compact" onSubmit={addReview}>
            <button className="iconButton" type="button" onClick={() => setSelectedMovie(null)} aria-label="Close">
              <X size={20} />
            </button>
            <h2>Rate {selectedMovie.title}</h2>
            <label>
              <span>Your name</span>
              <input required value={reviewForm.reviewer} onChange={(event) => setReviewForm({ ...reviewForm, reviewer: event.target.value })} />
            </label>
            <div className="ratingPicker">
              <Stars interactive value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} />
              <strong>{reviewForm.rating}.0</strong>
            </div>
            <label>
              <span>Review</span>
              <textarea required value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} />
            </label>
            <button className="primaryButton wide" type="submit">Publish Review</button>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;
