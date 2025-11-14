# 时尚推荐网站

基于 Supabase 和 Netlify 的现代化服装推荐平台，提供个性化时尚推荐服务。

## ✨ 功能特性

- 👗 **多品类服装展示** - 支持女装、男装、童装、配饰等多种分类
- 🎯 **个性化推荐** - 基于用户浏览历史和偏好进行智能推荐
- 🔐 **用户认证系统** - 完整的注册、登录、个人中心功能
- 📱 **响应式设计** - 完美适配桌面和移动设备
- ⚡ **现代化技术栈** - React + Vite + Supabase

## 🏗️ 项目结构

```
src/
├── components/          # 公共组件
│   └── Header.jsx      # 导航头部
├── pages/              # 页面组件
│   ├── Home.jsx        # 首页
│   ├── ClothDetail.jsx # 服装详情页
│   └── Profile.jsx     # 个人中心页
├── supabase.js         # Supabase 配置和 API
├── App.jsx             # 主应用组件
├── App.css             # 应用样式
├── index.css           # 全局样式
└── main.jsx            # 应用入口
```

## 🗄️ 数据库设计

项目使用 Supabase 作为后端，包含 3 张核心数据表：

### 1. 服装表 (clothes)
- 存储服装基本信息（名称、描述、价格、分类等）
- 支持尺寸、颜色、材质等属性
- 启用行级安全策略（RLS）

### 2. 推荐记录表 (recommendations)
- 记录用户浏览和推荐历史
- 建立用户与服装的关联关系
- 支持个性化推荐算法

### 3. 用户信息表 (profiles)
- 扩展用户基本资料
- 存储风格偏好等个性化信息
- 与 Supabase Auth 集成

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <项目地址>
cd fashion-recommendation-app
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 设置 Supabase 数据库

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase_tables.sql` 文件内容
3. 获取项目 URL 和 Anon Key 填入环境变量

### 5. 本地开发
```bash
npm run dev
```

### 6. 构建部署
```bash
npm run build
```

## 🌐 部署到 Netlify

1. 将代码推送到 GitHub 仓库
2. 在 [Netlify](https://netlify.com) 连接 GitHub 仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`dist`
5. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📱 页面功能

### 首页 (/)
- 服装分类筛选和展示
- 热门推荐区域
- 个性化推荐入口

### 服装详情页 (/cloth/:id)
- 详细服装信息展示
- 相似推荐
- 用户行为记录（登录状态下）

### 个人中心 (/profile)
- 用户注册/登录
- 个人资料管理
- 推荐历史查看

## 🔧 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **路由管理**: React Router DOM
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)
- **样式方案**: CSS3 + Flexbox/Grid
- **部署平台**: Netlify

## 🎨 设计特色

- **现代简约风格** - 清新配色，简洁布局
- **渐变色应用** - 使用渐变背景增强视觉层次
- **卡片式设计** - 统一的内容卡片样式
- **交互反馈** - 丰富的悬停和点击效果
- **响应式布局** - 完美适配各种屏幕尺寸

## 📈 扩展建议

1. **图片上传功能** - 集成 Supabase Storage 存储服装图片
2. **购物车功能** - 添加购物车和订单管理
3. **收藏功能** - 用户收藏喜欢的服装
4. **搜索功能** - 支持关键词搜索服装
5. **评价系统** - 用户对服装进行评价和打分
6. **社交分享** - 集成社交平台分享功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License