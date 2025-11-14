import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi, recommendationApi } from '../supabase'

const Profile = ({ user, onLogin }) => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    gender: '',
    style_preference: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userRecommendations, setUserRecommendations] = useState([])
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // 加载用户推荐历史
      const { data: recommendations } = await recommendationApi.getUserRecommendations(user.id)
      setUserRecommendations(recommendations || [])
      
      // 设置用户信息
      setUserInfo({
        email: user.email,
        username: user.user_metadata?.username || '用户',
        gender: user.user_metadata?.gender || '未设置',
        style_preference: user.user_metadata?.style_preference || '未设置'
      })
    } catch (error) {
      console.error('加载用户数据失败:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // 登录
        const { data, error } = await userApi.signIn(formData.email, formData.password)
        if (error) throw error
        
        onLogin(data.user)
        navigate('/')
      } else {
        // 注册
        const userData = {
          username: formData.username,
          gender: formData.gender,
          style_preference: formData.style_preference
        }
        
        const { data, error } = await userApi.signUp(formData.email, formData.password, userData)
        if (error) throw error
        
        setError('注册成功！请检查您的邮箱验证邮件。')
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await userApi.signOut()
    onLogin(null)
    navigate('/')
  }

  const stylePreferences = [
    '休闲', '商务', '运动', '时尚', '复古', '简约', '甜美', '街头'
  ]

  if (user) {
    return (
      <div className="container">
        {/* 用户信息区域 */}
        <section style={{ marginBottom: '40px' }}>
          <div className="card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                fontWeight: '600'
              }}>
                {userInfo?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  {userInfo?.username}
                </h1>
                <p style={{ color: '#64748b' }}>{userInfo?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-2">
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#475569'
                }}>
                  性别
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '500' }}>
                  {userInfo?.gender}
                </p>
              </div>
              
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#475569'
                }}>
                  风格偏好
                </h3>
                <p style={{ fontSize: '18px', fontWeight: '500' }}>
                  {userInfo?.style_preference}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ marginTop: '24px' }}
            >
              退出登录
            </button>
          </div>
        </section>

        {/* 推荐历史 */}
        <section>
          <h2 style={{
            marginBottom: '24px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            我的推荐历史
          </h2>
          
          {userRecommendations.length === 0 ? (
            <div className="card text-center">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>
                暂无推荐历史
              </p>
              <Link to="/" className="btn btn-primary">
                开始浏览服装
              </Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {userRecommendations.slice(0, 6).map(rec => (
                <div key={rec.id} className="card">
                  {rec.clothes && (
                    <>
                      <div style={{
                        width: '100%',
                        height: '120px',
                        background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        fontSize: '40px'
                      }}>
                        {rec.clothes.category === 'women' ? '👗' : 
                         rec.clothes.category === 'men' ? '👔' : 
                         rec.clothes.category === 'kids' ? '👶' : '👜'}
                      </div>
                      
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
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        {rec.reason || '个性化推荐'}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#667eea'
                        }}>
                          ¥{rec.clothes.price}
                        </span>
                        <Link 
                          to={`/cloth/${rec.clothes.id}`}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          查看
                        </Link>
                      </div>
                      
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        marginTop: '8px'
                      }}>
                        {new Date(rec.viewed_at).toLocaleDateString('zh-CN')}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* 登录/注册切换 */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: isLogin ? 'white' : 'transparent',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: !isLogin ? 'white' : 'transparent',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="card">
          <h2 style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>

          {error && (
            <div className={`${error.includes('成功') ? 'success' : 'error'}`} style={{
              background: error.includes('成功') ? '#f0fdf4' : '#fee2e2',
              color: error.includes('成功') ? '#166534' : '#dc2626',
              border: error.includes('成功') ? '1px solid #bbf7d0' : '1px solid #fecaca',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                用户名
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="请输入用户名"
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              邮箱地址
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="请输入邮箱地址"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              密码
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder="请输入密码"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="">请选择性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  风格偏好
                </label>
                <select
                  name="style_preference"
                  value={formData.style_preference}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="">请选择风格偏好</option>
                  {stylePreferences.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            {isLogin ? '没有账户？' : '已有账户？'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                marginLeft: '4px',
                fontWeight: '500'
              }}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
        </form>

        {/* 功能说明 */}
        <div className="card mt-8">
          <h3 style={{
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🎯 个性化推荐功能
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '8px' }}>✓ 基于您的浏览历史智能推荐</li>
            <li style={{ marginBottom: '8px' }}>✓ 根据风格偏好精准匹配</li>
            <li style={{ marginBottom: '8px' }}>✓ 记录您的喜欢和收藏</li>
            <li>✓ 季节性趋势分析推荐</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Profile