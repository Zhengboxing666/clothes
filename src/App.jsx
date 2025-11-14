import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import ClothDetail from './pages/ClothDetail'
import Profile from './pages/Profile'
import { userApi } from './supabase'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await userApi.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('检查用户状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    await userApi.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/cloth/:id" element={<ClothDetail user={user} />} />
            <Route path="/profile" element={<Profile user={user} onLogin={handleLogin} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App