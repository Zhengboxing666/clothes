import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { clothesApi, recommendationApi, userApi, cartApi, favoritesApi } from '../supabase'

const ClothDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cloth, setCloth] = useState(null)
  const [similarClothes, setSimilarClothes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendationAdded, setRecommendationAdded] = useState(false)
  
  // 新增状态
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // success, error, info

  useEffect(() => {
    if (id) {
      loadClothDetail()
    }
  }, [id, user])

  // 显示消息
  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadClothDetail = async () => {
    try {
      setLoading(true)
      
      // 加载服装详情
      const { data: clothData, error: clothError } = await clothesApi.getClothById(id)
      if (clothError) throw clothError
      
      if (!clothData) {
        setError('服装不存在')
        return
      }

      setCloth(clothData)

      // 设置默认选择第一个尺寸和颜色
      if (clothData.sizes) {
        const sizes = clothData.sizes.split(',')
        setSelectedSize(sizes[0]?.trim())
      }
      if (clothData.colors) {
        const colors = clothData.colors.split(',')
        setSelectedColor(colors[0]?.trim())
      }

      // 加载相似服装
      const { data: similarData } = await clothesApi.getClothesByCategory(clothData.category)
      setSimilarClothes((similarData || []).filter(item => item.id !== id).slice(0, 3))

      // 检查是否已收藏
      if (user) {
        const { data: favoriteData } = await favoritesApi.isFavorite(user.id, id)
        setIsFavorite(!!favoriteData)

        // 记录推荐
        if (!recommendationAdded) {
          await recommendationApi.addRecommendation(
            user.id, 
            id, 
            '用户查看详情'
          )
          setRecommendationAdded(true)
        }
      }

    } catch (err) {
      setError('加载服装详情失败: ' + err.message)
      console.error('加载失败:', err)
    } finally {
      setLoading(false)
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

  // 添加到购物车
  const handleAddToCart = async () => {
    if (!user) {
      showMessage('请先登录后再添加到购物车', 'error')
      return
    }

    if (!selectedSize || !selectedColor) {
      showMessage('请选择尺寸和颜色', 'error')
      return
    }

    try {
      const { error } = await cartApi.addToCart(
        user.id,
        cloth.id,
        selectedSize,
        selectedColor,
        1
      )

      if (error) throw error
      showMessage('已添加到购物车', 'success')
    } catch (err) {
      showMessage('添加失败，请重试', 'error')
      console.error('添加购物车失败:', err)
    }
  }

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (!user) {
      showMessage('请先登录后再收藏', 'error')
      return
    }

    try {
      if (isFavorite) {
        const { error } = await favoritesApi.removeFromFavorites(user.id, cloth.id)
        if (error) throw error
        setIsFavorite(false)
        showMessage('已取消收藏', 'info')
      } else {
        const { error } = await favoritesApi.addToFavorites(user.id, cloth.id)
        if (error) throw error
        setIsFavorite(true)
        showMessage('已添加到收藏', 'success')
      }
    } catch (err) {
      showMessage('操作失败，请重试', 'error')
      console.error('收藏操作失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>正在加载服装详情...</div>
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

  if (!cloth) {
    return (
      <div className="container">
        <div className="error">服装不存在</div>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-8">
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

      {/* 返回按钮 */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '32px' }}
      >
        ← 返回
      </button>

      <div className="grid grid-2" style={{ gap: '40px', alignItems: 'start' }}>
        {/* 服装图片区域 */}
        <div>
          <div style={{
            background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
            borderRadius: '16px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '120px',
            marginBottom: '24px'
          }}>
            {getCategoryIcon(cloth.category)}
          </div>
          
          {/* 标签信息 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: '#667eea',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {getCategoryLabel(cloth.category)}
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {cloth.season || '四季通用'}
            </span>
            {cloth.material && (
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {cloth.material}
              </span>
            )}
          </div>
        </div>

        {/* 服装详情信息 */}
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#1e293b'
          }}>
            {cloth.name}
          </h1>
          
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '24px'
          }}>
            ¥{cloth.price}
          </div>

          <p style={{
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '32px',
            fontSize: '16px'
          }}>
            {cloth.description}
          </p>

          {/* 尺寸选择 */}
          {cloth.sizes && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1e293b'
              }}>
                选择尺寸 <span style={{ color: '#ef4444', fontSize: '14px' }}>*</span>
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {cloth.sizes.split(',').map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size.trim())}
                    style={{
                      border: selectedSize === size.trim() ? '2px solid #667eea' : '2px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedSize === size.trim() ? '#667eea' : '#475569',
                      background: selectedSize === size.trim() ? '#f0f4ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSize !== size.trim()) {
                        e.target.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSize !== size.trim()) {
                        e.target.style.background = '#ffffff'
                      }
                    }}
                  >
                    {size.trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 颜色选择 */}
          {cloth.colors && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1e293b'
              }}>
                选择颜色 <span style={{ color: '#ef4444', fontSize: '14px' }}>*</span>
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {cloth.colors.split(',').map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color.trim())}
                    style={{
                      border: selectedColor === color.trim() ? '2px solid #667eea' : '2px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedColor === color.trim() ? '#667eea' : '#475569',
                      background: selectedColor === color.trim() ? '#f0f4ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedColor !== color.trim()) {
                        e.target.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedColor !== color.trim()) {
                        e.target.style.background = '#ffffff'
                      }
                    }}
                  >
                    {color.trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 选择状态显示 */}
          {(cloth.sizes || cloth.colors) && (
            <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>当前选择：</div>
              <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '500' }}>
                {selectedSize && `尺寸：${selectedSize}`}
                {selectedSize && selectedColor && ' | '}
                {selectedColor && `颜色：${selectedColor}`}
                {(!selectedSize && cloth.sizes) && '请选择尺寸'}
                {(!selectedColor && cloth.colors) && '请选择颜色'}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
            >
              🛒 加入购物车
            </button>
            <button 
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`} 
              style={{ flex: 1 }}
              onClick={toggleFavorite}
            >
              {isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>

          {recommendationAdded && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '14px'
            }}>
              ✅ 已记录您的浏览偏好，将为您推荐相似款式
            </div>
          )}
        </div>
      </div>

      {/* 相似推荐 */}
      {similarClothes.length > 0 && (
        <section style={{ marginTop: '60px' }}>
          <h2 style={{
            marginBottom: '32px',
            fontSize: '28px',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            相似推荐
          </h2>
          <div className="grid grid-3">
            {similarClothes.map(similarCloth => (
              <div key={similarCloth.id} className="card">
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  fontSize: '48px'
                }}>
                  {getCategoryIcon(similarCloth.category)}
                </div>
                
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {similarCloth.name}
                </h3>
                
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
                    ¥{similarCloth.price}
                  </span>
                </div>
                
                <Link 
                  to={`/cloth/${similarCloth.id}`} 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  查看详情
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ClothDetail