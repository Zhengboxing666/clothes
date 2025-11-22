import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { favoritesApi } from '../supabase'

const Favorites = ({ user }) => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setError('请先登录查看收藏')
      setLoading(false)
    }
  }, [user])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const { data, error } = await favoritesApi.getUserFavorites(user.id)
      
      if (error) throw error
      
      setFavorites(data || [])
    } catch (err) {
      setError('加载收藏失败: ' + err.message)
      console.error('加载收藏失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const removeFromFavorites = async (clothId) => {
    try {
      const { error } = await favoritesApi.removeFromFavorites(user.id, clothId)
      
      if (error) throw error
      
      setFavorites(favorites.filter(item => item.cloth_id !== clothId))
      showMessage('已取消收藏', 'info')
    } catch (err) {
      showMessage('取消收藏失败', 'error')
      console.error('取消收藏失败:', err)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'women': return '👗'
      case 'men': return '👔'
      case 'kids': return '👶'
      case 'accessories': return '👜'
      default: return '👕'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'women': return '女装'
      case 'men': return '男装'
      case 'kids': return '童装'
      case 'accessories': return '配饰'
      default: return '服装'
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>正在加载收藏...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-8">
          返回首页
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container text-center">
        <h2 style={{ marginBottom: '24px' }}>请先登录</h2>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          登录后即可查看和管理您的收藏
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: '1000',
          padding: '16px 24px',
          borderRadius: '8px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: messageType === 'success' ? '#10b981' : 
                      messageType === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {message}
        </div>
      )}

      {/* 页面标题 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          ❤️ 我的收藏 ({favorites.length}件商品)
        </h1>
        
        {favorites.length > 0 && (
          <Link to="/" className="btn btn-primary">
            去收藏更多
          </Link>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center" style={{ padding: '80px 0' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>❤️</div>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>还没有收藏任何商品</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            收藏喜欢的商品，方便以后查看和购买
          </p>
          <Link to="/" className="btn btn-primary">
            去购物收藏
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {favorites.map((item) => (
            <div key={item.id} className="card">
              {/* 商品图片 */}
              <Link to={`/cloth/${item.cloth_id}`}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  fontSize: '64px',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease'
                }}>
                  {getCategoryIcon(item.clothes.category)}
                </div>
              </Link>
              
              {/* 商品信息 */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  <Link to={`/cloth/${item.cloth_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {item.clothes.name}
                  </Link>
                </h3>
                
                {/* 标签 */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginRight: '4px'
                  }}>
                    {getCategoryLabel(item.clothes.category)}
                  </span>
                  {item.clothes.season && (
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.clothes.season}
                    </span>
                  )}
                </div>

                {/* 描述 */}
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.clothes.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#667eea'
                  }}>
                    ¥{item.clothes.price}
                  </span>
                  
                  <span style={{
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    收藏于 {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link 
                    to={`/cloth/${item.cloth_id}`} 
                    className="btn btn-primary" 
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    查看详情
                  </Link>
                  <button
                    onClick={() => removeFromFavorites(item.cloth_id)}
                    className="btn btn-danger"
                    style={{ padding: '12px 16px' }}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites