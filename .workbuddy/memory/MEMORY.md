# 衣橱搭配App 项目记忆

## 项目结构
- 前端：React 18 + Vite + Tailwind CSS + Redux Toolkit、端口 5173
- 后端：Express.js + SQLite + JWT、端口 3001
- 数据库文件：server/closetmate.db（SQLite）
- 图片上传目录：server/uploads/

## 启动方式
- 后端：`cd server && node index.js`
- 前端：`cd . && pnpm dev` 或 `./node_modules/.bin/vite.cmd --host`
- 开发时 Vite 代理 /api → http://localhost:3001

## 核心功能
- 用户系统：手机号/邮箱注册、JWT登录、密码修改、账号注销
- 物品管理：8个默认分类 + 自定义分类、图片上传、瀑布流展示
- 搭配功能：分步骤选择物品、AI模拟试穿（Canvas绘制）、喜欢/收藏/不喜欢反馈
- 个人中心：统计面板、互动记录查看、主题切换（粉色/蓝色双主题）

## PWA 支持
- 已完成 PWA 配置（manifest.json + Service Worker + 安装提示）
- 支持添加到安卓主屏幕，全屏运行，离线使用
- App 图标已生成（8种尺寸）
- 安装方法：Chrome打开 → 菜单 → "添加到主屏幕"

## 主题颜色
- 女性主题(PINK)：主色 #E8A0BF、强调色 #B76E79
- 男性主题(GRAY)：主色 #3B5998、强调色 #F59E0B
