import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查配置是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置缺失！请检查 .env 文件')
  console.log('请在项目根目录创建 .env 文件并填入：')
  console.log('VITE_SUPABASE_URL=您的项目URL')
  console.log('VITE_SUPABASE_ANON_KEY=您的anon密钥')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表结构配置
export const TABLES = {
  USERS: 'users',
  CLOTHES: 'clothes',
  RECOMMENDATIONS: 'recommendations',
  CART: 'cart',
  FAVORITES: 'favorites',
  PROFILES: 'profiles'
}

// 用户相关操作
export const userApi = {
  // 获取当前用户信息
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 注册
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
}

// 服装相关操作
export const clothesApi = {
  // 获取所有服装
  async getAllClothes() {
    const { data, error } = await supabase
      .from(TABLES.CLOTHES)
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 根据ID获取服装详情
  async getClothById(id) {
    const { data, error } = await supabase
      .from(TABLES.CLOTHES)
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // 根据类别获取服装
  async getClothesByCategory(category) {
    const { data, error } = await supabase
      .from(TABLES.CLOTHES)
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// 推荐相关操作
export const recommendationApi = {
  // 获取用户的推荐历史
  async getUserRecommendations(userId) {
    const { data, error } = await supabase
      .from(TABLES.RECOMMENDATIONS)
      .select(`
        *,
        clothes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 添加推荐记录
  async addRecommendation(userId, clothId, reason) {
    const { data, error } = await supabase
      .from(TABLES.RECOMMENDATIONS)
      .insert({
        user_id: userId,
        cloth_id: clothId,
        reason: reason,
        viewed_at: new Date().toISOString()
      })
    return { data, error }
  },

  // 获取热门推荐
  async getPopularRecommendations(limit = 10) {
    const { data, error } = await supabase
      .from(TABLES.RECOMMENDATIONS)
      .select(`
        cloth_id,
        clothes (*)
      `)
      .limit(limit)
    return { data, error }
  }
}

// 购物车相关操作
export const cartApi = {
  // 获取用户的购物车
  async getUserCart(userId) {
    const { data, error } = await supabase
      .from(TABLES.CART)
      .select(`
        *,
        clothes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 添加商品到购物车
  async addToCart(userId, clothId, size, color, quantity = 1) {
    const { data, error } = await supabase
      .from(TABLES.CART)
      .upsert({
        user_id: userId,
        cloth_id: clothId,
        size: size,
        color: color,
        quantity: quantity
      }, {
        onConflict: 'user_id,cloth_id,size,color'
      })
    return { data, error }
  },

  // 更新购物车商品数量
  async updateCartItem(userId, cartItemId, quantity) {
    const { data, error } = await supabase
      .from(TABLES.CART)
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId)
    return { data, error }
  },

  // 删除购物车商品
  async removeFromCart(userId, cartItemId) {
    const { data, error } = await supabase
      .from(TABLES.CART)
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId)
    return { data, error }
  },

  // 清空购物车
  async clearCart(userId) {
    const { data, error } = await supabase
      .from(TABLES.CART)
      .delete()
      .eq('user_id', userId)
    return { data, error }
  }
}

// 收藏相关操作
export const favoritesApi = {
  // 获取用户的收藏
  async getUserFavorites(userId) {
    const { data, error } = await supabase
      .from(TABLES.FAVORITES)
      .select(`
        *,
        clothes (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 添加收藏
  async addToFavorites(userId, clothId) {
    const { data, error } = await supabase
      .from(TABLES.FAVORITES)
      .insert({
        user_id: userId,
        cloth_id: clothId
      })
    return { data, error }
  },

  // 检查是否已收藏
  async isFavorite(userId, clothId) {
    const { data, error } = await supabase
      .from(TABLES.FAVORITES)
      .select('id')
      .eq('user_id', userId)
      .eq('cloth_id', clothId)
      .single()
    return { data, error }
  },

  // 取消收藏
  async removeFromFavorites(userId, clothId) {
    const { data, error } = await supabase
      .from(TABLES.FAVORITES)
      .delete()
      .eq('user_id', userId)
      .eq('cloth_id', clothId)
    return { data, error }
  }
}

// 用户信息相关操作
export const profileApi = {
  // 获取用户档案
  async getProfile(userId) {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 更新用户档案
  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .upsert({
        id: userId,
        ...profileData
      })
    return { data, error }
  }
}