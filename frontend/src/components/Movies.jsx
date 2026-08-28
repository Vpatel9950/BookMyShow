import React, { useEffect, useState } from 'react';
import { moviesStyles } from '../assets/dummyStyles';
import { Link } from 'react-router-dom';
import { Tickets } from 'lucide-react';
import { getAllMovies } from '../api/movieApi';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMovies()
      .then((data) => {
        const formatted = data.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.genre || 'Action',
          img: m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
        }));
        setMovies(formatted);
      })
      .catch((err) => {
        console.error('Failed to load home movies:', err);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleMovies = movies.slice(0, 6);

  return (
    <section className={moviesStyles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
      `}</style>

      <h2
        style={{
          fontFamily: "'Dancing Script',cursive",
        }}
        className={moviesStyles.title}
      >
        Featured Movies
      </h2>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Loading movies from server...</div>
      ) : visibleMovies.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">No movies currently available.</div>
      ) : (
        <div className={moviesStyles.grid}>
          {visibleMovies.map((m) => (
            <article key={m.id} className={moviesStyles.movieArticle}>
              <Link to={`/movie/${m.id}`} className={moviesStyles.movieLink}>
                <img
                  src={m.img}
                  alt={m.title}
                  loading="lazy"
                  className={moviesStyles.movieImage}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/320x480?text=No+Image';
                  }}
                />
              </Link>

              <div className={moviesStyles.movieInfo}>
                <div className={moviesStyles.titleContainer}>
                  <Tickets className={moviesStyles.ticketsIcon} />
                  <span
                    id={`movie-title-${m.id}`}
                    className={moviesStyles.movieTitle}
                    style={{
                      fontFamily: "'Pacifico' , cursive",
                    }}
                  >
                    {m.title}
                  </span>
                </div>

                <div className={moviesStyles.categoryContainer}>
                  <span className={moviesStyles.categoryText}>{m.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Movies;
