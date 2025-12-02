import { useState, useEffect } from 'react'
import './App.css'
import { createAnniversary } from './models/Anniversary'
import { loadAnniversaries, saveAnniversaries, addAnniversary, deleteAnniversary } from './services/StorageService'
import { formatDate, calculateDaysUntil, formatCountdown } from './services/DateService'
import { getPermissionStatus, requestPermission, showTestNotification } from './services/NotificationService'
import useLocalStorage from './hooks/useLocalStorage'
import useNotifications from './hooks/useNotifications'
import useCountdown from './hooks/useCountdown'

function App() {
  const [anniversaries, setAnniversaries] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('birthday')
  const [storageInfo, setStorageInfo] = useState({ count: 0, sizeKB: 0 })

  // Demo: useLocalStorage hook
  const [demoValue, setDemoValue, removeDemoValue] = useLocalStorage('demo-key', 'Hello from localStorage!')

  // Demo: useNotifications hook
  const notifications = useNotifications(anniversaries, 60000)

  // Demo: useCountdown hook for a sample date
  const sampleDate = '2025-12-25' // Christmas
  const countdown = useCountdown(sampleDate)

  // Load anniversaries on mount
  useEffect(() => {
    const loaded = loadAnniversaries()
    setAnniversaries(loaded)
    updateStorageInfo()
  }, [])

  const updateStorageInfo = () => {
    const loaded = loadAnniversaries()
    const data = localStorage.getItem('anniversary-app-data')
    setStorageInfo({
      count: loaded.length,
      sizeKB: data ? (data.length / 1024).toFixed(2) : 0
    })
  }

  const handleAddAnniversary = () => {
    try {
      if (!title || !date) {
        alert('Please enter title and date')
        return
      }

      const newAnniversary = createAnniversary({
        title,
        date,
        description,
        category,
        reminderSettings: {
          enabled: true,
          timings: [0, 1, 7],
          timeOfDay: '09:00'
        }
      })

      addAnniversary(newAnniversary)
      const updated = loadAnniversaries()
      setAnniversaries(updated)
      updateStorageInfo()

      // Clear form
      setTitle('')
      setDate('')
      setDescription('')
      setCategory('birthday')

      alert('Anniversary added successfully!')
    } catch (error) {
      alert('Error adding anniversary: ' + error.message)
    }
  }

  const handleDeleteAnniversary = (id) => {
    try {
      deleteAnniversary(id)
      const updated = loadAnniversaries()
      setAnniversaries(updated)
      updateStorageInfo()
    } catch (error) {
      alert('Error deleting anniversary: ' + error.message)
    }
  }

  const handleRequestNotificationPermission = async () => {
    const granted = await notifications.requestPermission()
    if (granted) {
      alert('Notification permission granted!')
    } else {
      alert('Notification permission denied')
    }
  }

  const handleTestNotification = () => {
    const notification = showTestNotification()
    if (notification) {
      alert('Test notification sent! Check your system notifications.')
    } else {
      alert('Could not send notification. Permission may be denied.')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Simple Anniversary App</h1>
        <p className="app-subtitle">Data Layer Implementation Test</p>
      </header>

      <div className="container">
        {/* Data Layer Demo Section */}
        <section className="demo-section">
          <h2 className="demo-title">Data Layer Demo</h2>
          <div className="card">
            <h3 className="card-header">System Status</h3>
            <div className="card-body">
              <p><strong>Anniversaries Stored:</strong> {storageInfo.count}</p>
              <p><strong>Storage Size:</strong> {storageInfo.sizeKB} KB</p>
              <p><strong>Notification Support:</strong> {notifications.isSupported ? 'Yes' : 'No'}</p>
              <p><strong>Notification Permission:</strong> {notifications.permission}</p>
              <p><strong>Last Notification Check:</strong> {notifications.lastCheck ? notifications.lastCheck.toLocaleTimeString() : 'Never'}</p>
            </div>
          </div>
        </section>

        {/* useCountdown Hook Demo */}
        <section className="demo-section">
          <h2 className="demo-title">useCountdown Hook Demo</h2>
          <div className="card">
            <h3 className="card-header">Christmas 2025 Countdown</h3>
            <div className="card-body">
              <p><strong>Date:</strong> {formatDate(sampleDate)}</p>
              <p><strong>Days Until:</strong> {countdown.daysUntil}</p>
              <p><strong>Countdown:</strong> {countdown.countdown}</p>
              <p><strong>Is Today:</strong> {countdown.isToday ? 'Yes' : 'No'}</p>
              <p><strong>Is Approaching:</strong> {countdown.isApproaching ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </section>

        {/* useLocalStorage Hook Demo */}
        <section className="demo-section">
          <h2 className="demo-title">useLocalStorage Hook Demo</h2>
          <div className="card">
            <div className="card-body">
              <p><strong>Current Value:</strong> {demoValue}</p>
              <div className="button-group" style={{ marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setDemoValue('Updated at ' + new Date().toLocaleTimeString())}
                >
                  Update Value
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={removeDemoValue}
                >
                  Clear Value
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Permission Section */}
        <section className="demo-section">
          <h2 className="demo-title">Notification System</h2>
          <div className="card">
            <div className="card-body">
              <p><strong>Permission Status:</strong> {notifications.permission}</p>
              <div className="button-group" style={{ marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleRequestNotificationPermission}
                  disabled={notifications.isGranted}
                >
                  Request Permission
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleTestNotification}
                  disabled={!notifications.isGranted}
                >
                  Test Notification
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Add Anniversary Form */}
        <section className="demo-section">
          <h2 className="demo-title">Add Anniversary</h2>
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  className="input"
                  placeholder="e.g., Mom's Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  className="input"
                  placeholder="Add notes..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleAddAnniversary}
              >
                Add Anniversary
              </button>
            </div>
          </div>
        </section>

        {/* Anniversaries List */}
        <section className="demo-section">
          <h2 className="demo-title">My Anniversaries ({anniversaries.length})</h2>
          {anniversaries.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <p>No anniversaries yet. Add one above to get started!</p>
              </div>
            </div>
          ) : (
            <div className="card-grid">
              {anniversaries.map((anniversary) => {
                const daysUntil = calculateDaysUntil(anniversary.date)
                const countdownText = formatCountdown(daysUntil)
                return (
                  <div key={anniversary.id} className="card">
                    <h3 className="card-header">{anniversary.title}</h3>
                    <div className="card-body">
                      <p><strong>Date:</strong> {formatDate(anniversary.date)}</p>
                      <p><strong>Countdown:</strong> {countdownText}</p>
                      <p><strong>Category:</strong> {anniversary.category}</p>
                      {anniversary.description && (
                        <p><strong>Notes:</strong> {anniversary.description}</p>
                      )}
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        onClick={() => handleDeleteAnniversary(anniversary.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
