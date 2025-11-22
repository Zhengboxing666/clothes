import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartApi, clothesApi } from '../supabase'

const Cart = ({ user }) => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    if (user) {
      loadCartItems()
    } else {
      setError('请先登录查看购物车')
      setLoading(false)
    }
  }, [user])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await cartApi.getUserCart(user.id)
      
      if (error) throw error
      
      setCartItems(data || [])
    } catch (err) {
      setError('加载购物车失败: ' + err.message)
      console.error('加载购物车失败:', err)
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

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const { error } = await cartApi.updateCartItem(user.id, itemId, newQuantity)
      
      if (error) throw error
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
      showMessage('数量已更新', 'success')
    } catch (err) {
      showMessage('更新失败', 'error')
      console.error('更新数量失败:', err)
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const { error } = await cartApi.removeFromCart(user.id, itemId)
      
      if (error) throw error
      
      setCartItems(cartItems.filter(item => item.id !== itemId))
      showMessage('已从购物车移除', 'info')
    } catch (err) {
      showMessage('移除失败', 'error')
      console.error('移除失败:', err)
    }
  }

  const clearCart = async () => {
    if (!window.confirm('确定要清空购物车吗？')) return

    try {
      const { error } = await cartApi.clearCart(user.id)
      
      if (error) throw error
      
      setCartItems([])
      showMessage('购物车已清空', 'info')
    } catch (err) {
      showMessage('清空失败', 'error')
      console.error('清空购物车失败:', err)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.clothes.price * item.quantity)
    }, 0)
  }

  const getTotalCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>正在加载购物车...</div>
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
          登录后即可查看和管理您的购物车
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
          🛒 我的购物车 ({getTotalCount()}件商品)
        </h1>
        
        {cartItems.length > 0 && (
          <button 
            onClick={clearCart}
            className="btn btn-danger"
          >
            清空购物车
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center" style={{ padding: '80px 0' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
          <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>购物车是空的</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            快去挑选喜欢的商品吧！
          </p>
          <Link to="/" className="btn btn-primary">
            去购物
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* 购物车商品列表 */}
          <div>
            {cartItems.map((item) => (
              <div key={item.id} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  {/* 商品图片 */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(45deg, #f0f4f8, #e2e8f0)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    flexShrink: 0
                  }}>
                    {getCategoryIcon(item.clothes.category)}
                  </div>

                  {/* 商品信息 */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {item.clothes.name}
                    </h3>
                    
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                      {item.size && `尺寸: ${item.size}`}
                      {item.size && item.color && ' | '}
                      {item.color && `颜色: ${item.color}`}
                    </div>

                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#667eea',
                      marginBottom: '16px'
                    }}>
                      ¥{item.clothes.price}
                    </div>

                    {/* 数量控制 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 12px', fontWeight: '500' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        移除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 购物车总结 */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '20px' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                订单总结
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>商品数量</span>
                  <span>{getTotalCount()}件</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>商品总价</span>
                  <span>¥{getTotalPrice().toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>运费</span>
                  <span>免运费</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
                  <span>总计</span>
                  <span style={{ color: '#667eea' }}>¥{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                结算订单
              </button>
              
              <Link to="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                继续购物
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart