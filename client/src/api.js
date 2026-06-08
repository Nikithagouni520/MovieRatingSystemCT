const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  movies: (params) => request(`/movies?${new URLSearchParams(params).toString()}`),
  genres: () => request("/movies/genres"),
  createMovie: (movie) => request("/movies", { method: "POST", body: JSON.stringify(movie) }),
  review: (movieId, review) =>
    request(`/movies/${movieId}/reviews`, { method: "POST", body: JSON.stringify(review) })
};
