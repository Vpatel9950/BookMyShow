export function formatDuration(mins) {
  if (!mins) return 'N/A';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function genreToCategory(genre) {
  if (!genre) return 'all';
  return genre.toLowerCase();
}

export function mapApiMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    synopsis: movie.description || '',
    description: movie.description || '',
    genre: movie.genre || '',
    category: genreToCategory(movie.genre),
    language: movie.language || '',
    duration: formatDuration(movie.durationMins),
    durationMins: movie.durationMins,
    releaseDate: movie.releaseDate,
    image: movie.posterUrl,
    img: movie.posterUrl,
    posterUrl: movie.posterUrl,
    rating: '8.0',
  };
}

export function groupShowsByDate(shows, timeZone = 'Asia/Kolkata') {
  const slotsByDate = {};

  shows.forEach((show) => {
    const iso = show.startTime;
    if (!iso) return;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;

    const parts = new Intl.DateTimeFormat('en', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const map = {};
    parts.forEach((p) => { if (p.type !== 'literal') map[p.type] = p.value; });
    const dateKey = `${map.year}-${map.month}-${map.day}`;

    if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
    slotsByDate[dateKey].push({
      showId: show.id,
      iso,
      audi: show.screen?.name || null,
      theater: show.screen?.theater?.name || null,
      city: show.screen?.theater?.city || null,
      availableCount: show.availableSeats?.length ?? 0,
    });
  });

  const dateKeys = Object.keys(slotsByDate).sort();
  return dateKeys.map((key) => {
    const [yy, mm, dd] = key.split('-').map(Number);
    const asDate = new Date(Date.UTC(yy, mm - 1, dd));
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(asDate);
    const shortDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(asDate);
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone }).format(asDate);

    const showtimes = slotsByDate[key]
      .map(({ showId, iso, audi, theater, city, availableCount }) => {
        const d = new Date(iso);
        const timeLabel = new Intl.DateTimeFormat('en-IN', {
          timeZone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(d);
        return { showId, time: timeLabel, datetime: iso, audi, theater, city, availableCount };
      })
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    return { date: key, dayName, shortDay, dateStr, showtimes };
  });
}

export function seatTypeToRowType(seatType) {
  if (seatType === 'GOLD' || seatType === 'PLATINUM') return 'recliner';
  return 'standard';
}
