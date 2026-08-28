import React, { useEffect, useState } from 'react';
import { movieDetailStyles } from '../assets/dummyStyles';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Star, User, Tv, Clock } from 'lucide-react';
import { getMovieById } from '../api/movieApi';
import { getShowsByMovie } from '../api/showApi';

const MovieDetailPage = () => {
  const { id } = useParams();
  const movieId = Number(id);
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const movieData = await getMovieById(movieId);
        setMovie(movieData);

        const showsData = await getShowsByMovie(movieId).catch(() => []);
        setShows(showsData);
      } catch (err) {
        toast.error('Movie not found on server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        Loading movie details from server...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={movieDetailStyles.notFoundContainer}>
        <div className={movieDetailStyles.notFoundContent}>
          <h2 className={movieDetailStyles.notFoundTitle}>Movie not found</h2>
          <Link to="/movies" className={movieDetailStyles.notFoundLink}>
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedToSeats = () => {
    if (!selectedShow) {
      toast.error('Please select a showtime first.');
      return;
    }
    navigate(`/movies/${movie.id}/seat-selector/${selectedShow.id}`);
  };

  return (
    <div className={movieDetailStyles.container}>
      <div className={movieDetailStyles.wrapper}>
        <div className={movieDetailStyles.header}>
          <Link to="/movies" className={movieDetailStyles.backButton}>
            <ArrowLeft size={18} />
            <span className={movieDetailStyles.backText}>Back</span>
          </Link>
        </div>

        {/* Movie Header */}
        <div className={movieDetailStyles.titleContainer}>
          <h1
            className={movieDetailStyles.movieTitle}
            style={{
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              textShadow: '0 4px 20px rgba(220, 38, 38, 0.6)',
              letterSpacing: '0.08em',
            }}
          >
            {movie.title}
          </h1>

          <div className={movieDetailStyles.movieMeta}>
            <span className={movieDetailStyles.metaItem}>
              <Star className={`${movieDetailStyles.metaIcon} ${movieDetailStyles.ratingIcon}`} />
              8.5/10
            </span>
            <span className={movieDetailStyles.metaItem}>
              <Clock className={`${movieDetailStyles.metaIcon} ${movieDetailStyles.durationIcon}`} />
              {movie.durationMins} Mins
            </span>
            <span className={movieDetailStyles.genreTag}>{movie.genre || 'Action'}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">
              {movie.language}
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className={movieDetailStyles.mainLayout}>
          <div className={movieDetailStyles.leftColumn}>
            <div className={movieDetailStyles.posterCard}>
              <div className={movieDetailStyles.posterImage} style={{ maxWidth: '320px' }}>
                <img
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                  alt={movie.title}
                  className={movieDetailStyles.posterImg}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/320x480?text=No+Image';
                  }}
                />
              </div>
            </div>
          </div>

          <div className={movieDetailStyles.rightColumns}>
            <div className={movieDetailStyles.showtimesCard}>
              <h3 className={movieDetailStyles.showtimesTitle} style={{ fontFamily: "'Cinzel',serif" }}>
                <Calendar className={movieDetailStyles.showtimesIcon} />
                <span>Available Shows</span>
              </h3>

              {shows.length === 0 ? (
                <div className="text-neutral-400 text-sm py-6 text-center">
                  No upcoming shows scheduled for this movie yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {shows.map((s) => {
                    const isSelected = selectedShow?.id === s.id;
                    const startTimeFormatted = s.startTime
                      ? new Date(s.startTime).toLocaleString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A';

                    const availSeats = s.availableSeats ? s.availableSeats.length : 0;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedShow(s)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-600/20'
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-white flex items-center gap-2">
                            <Tv size={16} className="text-amber-500" />
                            <span>{s.screen?.theater?.name || 'Multiplex Cinema'}</span>
                            <span className="text-xs font-normal text-neutral-400">({s.screen?.name})</span>
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-2">
                            <Clock size={14} className="text-red-400" />
                            <span>{startTimeFormatted}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{availSeats} seats available</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-400">₹{s.ticketPrice || 250}</div>
                          <div className="text-xs text-neutral-400">per ticket</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedShow && (
                <div className="pt-4">
                  <button
                    onClick={handleProceedToSeats}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-red-600/30 text-center"
                  >
                    Proceed to Seat Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className={movieDetailStyles.storyCard}>
          <h2 className={movieDetailStyles.storyTitle} style={{ fontFamily: "'Cinzel',serif" }}>
            Story & Overview
          </h2>
          <p className={movieDetailStyles.storyText}>{movie.description || 'No description available for this movie.'}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
