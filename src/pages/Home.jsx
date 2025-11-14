import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clothesApi, recommendationApi } from '../supabase'

const Home = ({ user }) => {
  const [clothes, setClothes] = useState([])
  const [popularRecommendations, setPopularRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'women', label: '女装' },
    { value: 'men', label: '男装' },
    { value: 'kids', label: '童装' },
    { value: 'accessories', label: '配饰' }
  ]

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 加载服装数据
      let clothesData
      if (selectedCategory === 'all') {
        const { data, error } = await clothesApi.getAllClothes()
        if (error) throw error
        clothesData = data || []
      } else {
        const { data, error } = await clothesApi.getClothesByCategory(selectedCategory)
        if (error) throw error
        clothesData = data || []
      }

      // 加载热门推荐
      const { data: recommendations } = await recommendationApi.getPopularRecommendations(6)
      
      setClothes(clothesData)
      setPopularRecommendations(recommendations || [])
    } catch (err) {
      setError('加载数据失败: ' + err.message)
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRandomRecommendationReason = () => {
    const reasons = [
      '根据您的浏览历史推荐',
      '热门款式，销量火爆',
      '新季新品，时尚前沿',
      '与您风格相似的用户也喜欢',
      '季节性推荐，适合当前天气'
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>正在加载时尚推荐...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={loadData} className="btn btn-primary mt-8">
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      {/* 英雄区域 */}
      <section style={{
        textAlign: 'center',
        padding: '60px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
          发现你的专属风格
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px' }}>
          基于AI算法的个性化服装推荐，为您打造完美形象
        </p>
        {!user && (
          <Link to="/profile" className="btn" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            立即体验个性化推荐
          </Link>
        )}
      </section>

      {/* 分类筛选 */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>精选分类</h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`btn ${selectedCategory === category.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '14px' }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* 服装展示 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: '600' }}>
          {selectedCategory === 'all' ? '所有服装' : categories.find(c => c.value === selectedCategory)?.label}
        </h2>
        
        {clothes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👕</div>
            <p style={{ fontSize: '18px' }}>暂无该分类的服装数据</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {clothes.map(cloth => (
              <div key={cloth.id} className="card">
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  fontSize: '48px'
                }}>
                  {cloth.category === 'women' ? '👗' : 
                   cloth.category === 'men' ? '👔' : 
                   cloth.category === 'kids' ? '👶' : '👜'}
                </div>
                
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  {cloth.name}
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {cloth.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#667eea'
                  }}>
                    ¥{cloth.price}
                  </span>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {categories.find(c => c.value === cloth.category)?.label}
                  </span>
                </div>
                
                <Link to={`/cloth/${cloth.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  查看详情
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 热门推荐 */}
      {popularRecommendations.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: '600' }}>
            热门推荐
          </h2>
          <div className="grid grid-3">
            {popularRecommendations.slice(0, 6).map((rec, index) => (
              <div key={index} className="card">
                <div style={{
                  background: 'linear-gradient(45deg, #ffeaa7, #fab1a0)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#e17055',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    热门
                  </span>
                </div>
                
                {rec.clothes && (
                  <>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {rec.clothes.name}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '12px',
                      marginBottom: '12px'
                    }}>
                      {getRandomRecommendationReason()}
                    </p>
                    <Link 
                      to={`/cloth/${rec.clothes.id}`} 
                      className="btn btn-primary" 
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      查看
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Home