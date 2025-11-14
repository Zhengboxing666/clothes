import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { clothesApi, recommendationApi, userApi } from '../supabase'

const ClothDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cloth, setCloth] = useState(null)
  const [similarClothes, setSimilarClothes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendationAdded, setRecommendationAdded] = useState(false)

  useEffect(() => {
    if (id) {
      loadClothDetail()
    }
  }, [id])

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

      // 加载相似服装
      const { data: similarData } = await clothesApi.getClothesByCategory(clothData.category)
      setSimilarClothes((similarData || []).filter(item => item.id !== id).slice(0, 3))

      // 如果用户已登录，记录推荐
      if (user && !recommendationAdded) {
        await recommendationApi.addRecommendation(
          user.id, 
          id, 
          '用户查看详情'
        )
        setRecommendationAdded(true)
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

          {/* 尺寸信息 */}
          {cloth.sizes && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1e293b'
              }}>
                可选尺寸
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {cloth.sizes.split(',').map(size => (
                  <span key={size} style={{
                    border: '2px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#475569'
                  }}>
                    {size.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 颜色信息 */}
          {cloth.colors && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1e293b'
              }}>
                可选颜色
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {cloth.colors.split(',').map(color => (
                  <span key={color} style={{
                    background: '#f1f5f9',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#475569'
                  }}>
                    {color.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>
              🛒 加入购物车
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }}>
              ❤️ 收藏
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