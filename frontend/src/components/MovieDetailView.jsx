import React, { useEffect, useState } from 'react'
import { movieDetailStyles, movieDetailCSS } from '../assets/dummyStyles'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Star, User } from 'lucide-react';
import { getMovieById, getShowsByMovie } from '../services/api';
import { mapApiMovie, groupShowsByDate } from '../utils/movieUtils';

const MovieDetailView = ({ backPath = '/movies', seatBasePath = '/movies' }) => {
  const { id } = useParams();
  const movieId = Number(id);
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimeDays, setShowtimeDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedShowId, setSelectedShowId] = useState(null);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    Promise.all([
      getMovieById(movieId),
      getShowsByMovie(movieId),
    ])
      .then(([movieData, shows]) => {
        setMovie(mapApiMovie(movieData));
        setShowtimeDays(groupShowsByDate(shows));
      })
      .catch(() => {
        toast.error('Failed to load movie details');
        setMovie(null);
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  useEffect(() => {
    if (showtimeDays.length === 0) {
      setSelectedDay(0);
      setSelectedShowId(null);
      return;
    }
    setSelectedDay((cur) => (cur >= 0 && cur < showtimeDays.length ? cur : 0));
    setSelectedShowId(null);
  }, [showtimeDays]);

  if (loading) {
    return (
      <div className={`${movieDetailStyles.container} flex items-center justify-center min-h-screen text-white`}>
        Loading...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={movieDetailStyles.notFoundContainer}>
        <div className={movieDetailStyles.notFoundContent}>
          <h2 className={movieDetailStyles.notFoundTitle}>Movie not found</h2>
          <Link to={backPath} className={movieDetailStyles.notFoundLink}>Back to Movies</Link>
        </div>
      </div>
    );
  }

  const handleTimeSelect = (showtime) => {
    setSelectedShowId(showtime.showId);
    navigate(`${seatBasePath}/${movie.id}/seat-selector/${showtime.showId}`);
  };

  const handleBookNow = () => {
    if (selectedShowId) {
      navigate(`${seatBasePath}/${movie.id}/seat-selector/${selectedShowId}`);
    } else {
      toast.error('Please select a showtime first');
    }
  };

  return (
    <div className={movieDetailStyles.container}>
      <div className={movieDetailStyles.wrapper}>
        <div className={movieDetailStyles.header}>
          <Link to={backPath} className={movieDetailStyles.backButton}>
            <ArrowLeft size={18}/>
            <span className={movieDetailStyles.backText}>Back</span>
          </Link>
        </div>

        <div className={movieDetailStyles.titleContainer}>
          <h1 className={movieDetailStyles.movieTitle} style={{
            fontFamily: "'Cinzel', 'Times New Roman', serif",
            textShadow: "0 4px 20px rgba(220, 38, 38, 0.6)",
            letterSpacing: "0.08em",
          }}>
            {movie.title}
          </h1>
          <div className={movieDetailStyles.movieMeta}>
            <span className={movieDetailStyles.metaItem}>
              <Star className={`${movieDetailStyles.metaIcon} ${movieDetailStyles.ratingIcon}`}/>
              {movie.language}
            </span>
            <span className={movieDetailStyles.metaItem}>
              <Star className={`${movieDetailStyles.metaIcon} ${movieDetailStyles.durationIcon}`}/>
              {movie.duration}
            </span>
            <span className={movieDetailStyles.genreTag}>{movie.genre}</span>
          </div>
        </div>

        <div className={movieDetailStyles.mainLayout}>
          <div className={movieDetailStyles.leftColumn}>
            <div className={movieDetailStyles.posterCard}>
              <div className={movieDetailStyles.posterImage} style={{ maxWidth: '320px' }}>
                <img src={movie.image} alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/320x480?text=No+Image';
                  }}
                  className={movieDetailStyles.posterImg}
                />
              </div>
            </div>
          </div>

          <div className={movieDetailStyles.rightColumns}>
            <div className={movieDetailStyles.showtimesCard}>
              <h3 className={movieDetailStyles.showtimesTitle} style={{ fontFamily: "'Cinzel',serif" }}>
                <Calendar className={movieDetailStyles.showtimesIcon}/>
                <span>Showtimes</span>
              </h3>

              {showtimeDays.length === 0 ? (
                <p className="text-gray-400 py-4">No showtimes available for this movie.</p>
              ) : (
                <>
                  <div className={movieDetailStyles.daySelection}>
                    {showtimeDays.map((day, index) => (
                      <button key={day.date} onClick={() => {
                        setSelectedDay(index);
                        setSelectedShowId(null);
                      }} className={`${movieDetailStyles.dayButton.base} ${
                        selectedDay === index
                          ? movieDetailStyles.dayButton.active
                          : movieDetailStyles.dayButton.inactive
                      }`}>
                        <div className={movieDetailStyles.dayName}>{day.shortDay}</div>
                        <div className={movieDetailStyles.dayDate}>{day.dateStr}</div>
                      </button>
                    ))}
                  </div>

                  <div className={movieDetailStyles.showtimesGrid}>
                    {showtimeDays[selectedDay]?.showtimes.map((showtime) => {
                      const isSoldOut = showtime.availableCount === 0;
                      return (
                        <button
                          key={showtime.showId}
                          onClick={() => !isSoldOut && handleTimeSelect(showtime)}
                          disabled={isSoldOut}
                          className={`${movieDetailStyles.timeButton.base} ${
                            selectedShowId === showtime.showId
                              ? movieDetailStyles.timeButton.active
                              : movieDetailStyles.timeButton.inactive
                          }`}
                          title={isSoldOut ? 'Sold out' : `${showtime.availableCount} seats available`}
                        >
                          <span>{showtime.time}</span>
                          {showtime.audi && (
                            <span className="text-xs opacity-70">{showtime.audi}</span>
                          )}
                          {isSoldOut && (
                            <span className={movieDetailStyles.soldOutBadge}>Sold Out</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedShowId && (
                    <div className={movieDetailStyles.proceedButton}>
                      <button onClick={handleBookNow} className={movieDetailStyles.bookButton}>
                        Proceed to Seat Selection
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className={movieDetailStyles.storyCard}>
          <h2 className={movieDetailStyles.storyTitle} style={{ fontFamily: "'Cinzel',serif" }}>
            Story
          </h2>
          <p className={movieDetailStyles.storyText}>{movie.synopsis || 'No description available.'}</p>
        </div>

        <style jsx>{movieDetailCSS}</style>
      </div>
    </div>
  );
};

export default MovieDetailView;
