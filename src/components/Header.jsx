import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cartApi, favoritesApi } from '../supabase'

const Header = ({ user, onLogout }) => {
  const [cartCount, setCartCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadCounts()
    }
  }, [user])

  const loadCounts = async () => {
    try {
      // 获取购物车数量
      const { data: cartData } = await cartApi.getUserCart(user.id)
      const cartItemCount = cartData?.reduce((total, item) => total + item.quantity, 0) || 0
      setCartCount(cartItemCount)

      // 获取收藏数量
      const { data: favoritesData } = await favoritesApi.getUserFavorites(user.id)
      setFavoritesCount(favoritesData?.length || 0)
    } catch (error) {
      console.error('获取购物车和收藏数量失败:', error)
    }
  }
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
              
              {/* 购物车和收藏图标 */}
              {user && (
                <>
                  <li style={{ position: 'relative' }}>
                    <Link to="/cart" style={{
                      textDecoration: 'none',
                      color: '#475569',
                      fontWeight: '500',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }} onMouseOver={(e) => e.target.style.color = '#667eea'} 
                       onMouseOut={(e) => e.target.style.color = '#475569'}>
                      🛒 购物车
                      {cartCount > 0 && (
                        <span style={{
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  
                  <li style={{ position: 'relative' }}>
                    <Link to="/favorites" style={{
                      textDecoration: 'none',
                      color: '#475569',
                      fontWeight: '500',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }} onMouseOver={(e) => e.target.style.color = '#667eea'} 
                       onMouseOut={(e) => e.target.style.color = '#475569'}>
                      ❤️ 收藏
                      {favoritesCount > 0 && (
                        <span style={{
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          {favoritesCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </>
              )}
              
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