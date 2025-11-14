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
  RECOMMENDATIONS: 'recommendations'
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