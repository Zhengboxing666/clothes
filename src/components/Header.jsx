import React from 'react'
import { Link } from 'react-router-dom'

const Header = ({ user, onLogout }) => {
  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#333',
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            👗 时尚推荐
          </Link>
          
          <nav>
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              gap: '24px',
              alignItems: 'center',
              margin: 0
            }}>
              <li>
                <Link to="/" style={{
                  textDecoration: 'none',
                  color: '#475569',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#667eea'} 
                   onMouseOut={(e) => e.target.style.color = '#475569'}>
                  首页
                </Link>
              </li>
              
              {user ? (
                <>
                  <li>
                    <Link to="/profile" style={{
                      textDecoration: 'none',
                      color: '#475569',
                      fontWeight: '500',
                      transition: 'color 0.3s ease'
                    }} onMouseOver={(e) => e.target.style.color = '#667eea'} 
                       onMouseOut={(e) => e.target.style.color = '#475569'}>
                      个人中心
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={onLogout}
                      className="btn btn-secondary"
                      style={{ fontSize: '14px' }}
                    >
                      退出登录
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/profile" className="btn btn-primary">
                    登录/注册
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header