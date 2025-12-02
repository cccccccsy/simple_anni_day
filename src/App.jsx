import { useState } from 'react'
import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Simple Anniversary App</h1>
        <p className="app-subtitle">Green Theme Design System Demo</p>
      </header>

      <div className="container">
        {/* Color Palette Section */}
        <section className="demo-section">
          <h2 className="demo-title">Color Palette</h2>
          <div className="theme-colors">
            <div className="color-swatch">
              <div className="color-box" style={{ backgroundColor: '#A8E6CF' }}></div>
              <div className="color-name">Primary</div>
              <div className="color-value">#A8E6CF</div>
              <div className="color-name" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Mint Green</div>
            </div>
            <div className="color-swatch">
              <div className="color-box" style={{ backgroundColor: '#4A7C59' }}></div>
              <div className="color-name">Secondary</div>
              <div className="color-value">#4A7C59</div>
              <div className="color-name" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Forest Green</div>
            </div>
            <div className="color-swatch">
              <div className="color-box" style={{ backgroundColor: '#E8F5E9' }}></div>
              <div className="color-name">Accent</div>
              <div className="color-value">#E8F5E9</div>
              <div className="color-name" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Light Sage</div>
            </div>
            <div className="color-swatch">
              <div className="color-box" style={{ backgroundColor: '#FAFAFA' }}></div>
              <div className="color-name">Background</div>
              <div className="color-value">#FAFAFA</div>
              <div className="color-name" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Soft White</div>
            </div>
            <div className="color-swatch">
              <div className="color-box" style={{ backgroundColor: '#2C3E50' }}></div>
              <div className="color-name">Text</div>
              <div className="color-value">#2C3E50</div>
              <div className="color-name" style={{ fontSize: '0.7rem', marginTop: '4px' }}>Dark Gray</div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="demo-section">
          <h2 className="demo-title">Card Components</h2>
          <div className="card-grid">
            <div className="card">
              <h3 className="card-header">Anniversary Countdown</h3>
              <div className="card-body">
                <p>Track your special moments and celebrate together. Coming soon!</p>
              </div>
            </div>
            <div className="card">
              <h3 className="card-header">Memory Gallery</h3>
              <div className="card-body">
                <p>Store and cherish your favorite memories in one beautiful place.</p>
              </div>
            </div>
            <div className="card">
              <h3 className="card-header">Love Notes</h3>
              <div className="card-body">
                <p>Share sweet messages and surprise your loved one every day.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="demo-section">
          <h2 className="demo-title">Button Components</h2>
          <div className="button-group">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Form Section */}
        <section className="demo-section">
          <h2 className="demo-title">Form Components</h2>
          <div className="form-demo">
            <div className="form-group">
              <label className="form-label" htmlFor="anniversary-date">
                Anniversary Date
              </label>
              <input
                type="date"
                id="anniversary-date"
                className="input"
                placeholder="Select your anniversary date"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="partner-name">
                Partner's Name
              </label>
              <input
                type="text"
                id="partner-name"
                className="input"
                placeholder="Enter your partner's name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">
                Love Message
              </label>
              <textarea
                id="message"
                className="input"
                placeholder="Write a sweet message..."
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Save Settings
            </button>
          </div>
        </section>

        {/* Typography Section */}
        <section className="demo-section">
          <h2 className="demo-title">Typography</h2>
          <div className="card">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
            <p>
              This is a paragraph demonstrating the default text styling.
              The green theme design system provides a cohesive and pleasant
              visual experience throughout the application.
            </p>
            <p>
              <a href="#demo">This is a link</a> showing the interactive states
              with our green color palette.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
