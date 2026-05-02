import './App.css'
import Game from "./Game/Game.tsx"
import Header from './Main/Header.tsx'
import Background from "./Background/Background.tsx"

function App() {

  return (
    <>
      <div className="app-shell">
        <main className="app-container app-main">
          <div className="app-header">
            <Header />
          </div>

          <div className="app-layout">
            <section className="card theme-card" aria-label="Theme">
              <div className="theme-title">Today's Theme</div>
              <div className="theme-body">
                Happy Birthday Vivian!
              </div>
            </section >

            <section className="card game-card">
              <Game />
            </section>
          </div>
        </main>
      </div>
      <div id="canvas-container">
        <Background />
      </div>
    </>
  )
}

export default App
