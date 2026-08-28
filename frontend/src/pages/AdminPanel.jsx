import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Film, Plus, Trash2, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import {
  getMovies, createMovie, deleteMovie,
  getTheaters, createShow,
} from '../services/api'

const AdminPanel = () => {
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [activeTab, setActiveTab] = useState('movies')
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', language: 'Hindi', genre: 'Action',
    durationMins: 120, releaseDate: '', posterUrl: '',
  })
  const [showForm, setShowForm] = useState({
    movieId: '', screenId: '1', startTime: '', endTime: '',
  })

  const loadData = () => {
    getMovies().then(setMovies).catch(() => {})
    getTheaters().then(setTheaters).catch(() => {})
  }

  useEffect(() => { loadData() }, [])

  const handleCreateMovie = async (e) => {
    e.preventDefault()
    try {
      await createMovie({ ...movieForm, durationMins: Number(movieForm.durationMins) })
      toast.success('Movie created')
      setMovieForm({ title: '', description: '', language: 'Hindi', genre: 'Action', durationMins: 120, releaseDate: '', posterUrl: '' })
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return
    try {
      await deleteMovie(id)
      toast.success('Movie deleted')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleCreateShow = async (e) => {
    e.preventDefault()
    try {
      const start = showForm.startTime.length === 16 ? `${showForm.startTime}:00` : showForm.startTime
      const end = showForm.endTime.length === 16 ? `${showForm.endTime}:00` : showForm.endTime
      await createShow({
        movie: { id: Number(showForm.movieId) },
        screen: { id: Number(showForm.screenId) },
        startTime: start,
        endTime: end,
      })
      toast.success('Show created with seats')
      setShowForm({ movieId: '', screenId: '1', startTime: '', endTime: '' })
    } catch (err) {
      toast.error(err.message)
    }
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm'

  return (
    <div>
    <Navbar/>
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <ToastContainer position="top-right" theme="dark" />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

        <div className="flex gap-4 mb-8">
          {['movies', 'shows'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'movies' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={handleCreateMovie} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus size={18}/> Add Movie
              </h2>
              {['title', 'description', 'language', 'genre', 'releaseDate', 'posterUrl'].map((field) => (
                <input key={field} placeholder={field} value={movieForm[field]}
                  onChange={(e) => setMovieForm({ ...movieForm, [field]: e.target.value })}
                  className={inputCls} required={field === 'title'} />
              ))}
              <input type="number" placeholder="Duration (mins)" value={movieForm.durationMins}
                onChange={(e) => setMovieForm({ ...movieForm, durationMins: e.target.value })}
                className={inputCls} required />
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                Create Movie
              </button>
            </form>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Film size={18}/> Movies ({movies.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {movies.map((m) => (
                  <div key={m.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-white text-sm">{m.title}</span>
                    <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shows' && (
          <form onSubmit={handleCreateShow} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 max-w-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={18}/> Schedule Show
            </h2>
            <select value={showForm.movieId} onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
              className={inputCls} required>
              <option value="">Select Movie</option>
              {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <select value={showForm.screenId} onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
              className={inputCls} required>
              <option value="1">Audi 1 (Screen 1)</option>
            </select>
            <input type="datetime-local" value={showForm.startTime}
              onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
              className={inputCls} required />
            <input type="datetime-local" value={showForm.endTime}
              onChange={(e) => setShowForm({ ...showForm, endTime: e.target.value })}
              className={inputCls} required />
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
              Create Show
            </button>
          </form>
        )}
      </div>
    </div>
    </div>
  )
}

export default AdminPanel
