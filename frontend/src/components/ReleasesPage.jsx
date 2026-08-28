import React, { useEffect, useState } from 'react'
import { releasesStyles } from '../assets/dummyStyles'
import { Link } from 'react-router-dom'
import { getMovies } from '../services/api'
import { mapApiMovie } from '../utils/movieUtils'

const ReleasesPage = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    getMovies()
      .then((data) => setMovies(data.map(mapApiMovie)))
      .catch(() => setMovies([]))
  }, [])

  return (
    <div className={releasesStyles.pageContainer}>
     <div className={releasesStyles.headerContainer}>
       <h1 className={releasesStyles.headerTitle}>NOW SHOWING</h1>
       <p className={releasesStyles.headerSubtitle}>
         Latest Movies • Book Your Tickets
       </p>
     </div>
     <div className={releasesStyles.movieGrid}>
       {movies.map(movie=>(
          <Link key={movie.id} to={`/movies/${movie.id}`} className={releasesStyles.movieCard}>
            <div className={releasesStyles.imageContainer}>
             <img 
             src={movie.image} 
             alt={movie.title} 
             className={releasesStyles.movieImage}
             onError={(e) => {
               e.currentTarget.onerror = null;
               e.currentTarget.src = 'https://via.placeholder.com/320x480?text=No+Image';
             }}
            />
            </div>
            <div className={releasesStyles.movieInfo}>
              <h3 className={releasesStyles.movieTitle}>{movie.title}</h3>
              <p className={releasesStyles.movieCategory}>{movie.genre}</p>
            </div>
          </Link>
       ))}
     </div>
    </div>
  )
}

export default ReleasesPage
