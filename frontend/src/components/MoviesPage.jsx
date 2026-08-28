import React, { useEffect, useState } from 'react';
import { moviesPageStyles } from '../assets/dummyStyles';
import { Link } from 'react-router-dom';
import { getAllMovies, getMoviesByGenre, searchMovies } from '../api/movieApi';
import { Search } from 'lucide-react';

const MoviesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMoviesData = async () => {
    try {
      setLoading(true);
      let data = [];
      if (searchQuery.trim()) {
        data = await searchMovies(searchQuery.trim());
      } else if (activeCategory !== 'all') {
        data = await getMoviesByGenre(activeCategory);
      } else {
        data = await getAllMovies();
      }

      const formatted = data.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.genre || 'Action',
        image: m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
        description: m.description,
        language: m.language,
        durationMins: m.durationMins,
      }));
      setMovies(formatted);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, [activeCategory, searchQuery]);

  const COLLAPSE_COUNT = 12;
  const visibleMovies = showAll ? movies : movies.slice(0, COLLAPSE_COUNT);

  const categories = [
    { id: 'all', name: 'All Movies' },
    { id: 'Action', name: 'Action' },
    { id: 'Horror', name: 'Horror' },
    { id: 'Comedy', name: 'Comedy' },
    { id: 'Adventure', name: 'Adventure' },
    { id: 'Drama', name: 'Drama' },
  ];

  return (
    <div className={moviesPageStyles.container}>
      {/* Category Buttons & Search Bar */}
      <section className={moviesPageStyles.categoriesSection}>
        <div className={moviesPageStyles.categoriesContainer}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className={moviesPageStyles.categoriesFlex}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${moviesPageStyles.categoryButton.base} ${
                    activeCategory === category.id
                      ? moviesPageStyles.categoryButton.active
                      : moviesPageStyles.categoryButton.inactive
                  }`}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery('');
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={moviesPageStyles.moviesSection}>
        <div className={moviesPageStyles.moviesContainer}>
          {loading ? (
            <div className="text-center py-16 text-neutral-400">Loading movies from CineDuniya...</div>
          ) : (
            <div className={moviesPageStyles.moviesGrid}>
              {visibleMovies.map((movie) => (
                <Link key={movie.id} to={`/movies/${movie.id}`} state={{ movie }} className={moviesPageStyles.movieCard}>
                  <div className={moviesPageStyles.movieImageContainer}>
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className={moviesPageStyles.movieImage}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://via.placeholder.com/320x480?text=No+Image';
                      }}
                    />
                  </div>

                  <div className={moviesPageStyles.movieInfo}>
                    <h3 className={moviesPageStyles.movieTitle}>{movie.title}</h3>
                    <div className={moviesPageStyles.movieCategory}>
                      <span className={moviesPageStyles.movieCategoryText}>{movie.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {movies.length === 0 && (
                <div className={moviesPageStyles.emptyState}>No movies found matching your selection.</div>
              )}
            </div>
          )}

          {movies.length > COLLAPSE_COUNT && (
            <div className={moviesPageStyles.showMoreContainer}>
              <button onClick={() => setShowAll(!showAll)} className={moviesPageStyles.showMoreButton}>
                {showAll ? 'Show Less' : `Show More (${movies.length - COLLAPSE_COUNT} more)`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MoviesPage;
