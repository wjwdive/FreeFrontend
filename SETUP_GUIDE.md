# 项目设置指南

## 解决npm权限问题

如果遇到npm权限问题，请按照以下步骤操作：

### 方案一：使用yarn（推荐）

```bash
# 安装yarn
npm install -g yarn

# 使用yarn安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 方案二：使用pnpm

```bash
# 安装pnpm
npm install -g pnpm

# 使用pnpm安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 方案三：修改npm配置

```bash
# 查看当前npm配置
npm config list

# 修改npm全局安装目录（解决权限问题）
npm config set prefix "j:\Projects25\Express\FreeFrontend\node_modules\global"
npm config set cache "j:\Projects25\Express\FreeFrontend\node_modules\cache"

# 重新安装依赖
npm install
```

### 方案四：手动创建node_modules目录结构

如果上述方法都不行，可以手动创建必要的目录结构：

```bash
# 创建node_modules目录
mkdir node_modules

# 创建必要的符号链接或手动安装核心依赖
```

## 项目启动命令

### 开发环境

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问: http://localhost:3000

### 生产构建

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 预览构建结果

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 项目结构说明

```
FreeFrontend/
├── src/                 # 源代码目录
│   ├── api/            # API接口
│   ├── components/      # 公共组件
│   ├── router/         # 路由配置
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   └── views/          # 页面组件
├── scripts/            # 脚本文件
├── .env.development    # 开发环境配置
├── .env.production     # 生产环境配置
├── vite.config.js      # Vite配置
└── package.json        # 项目配置
```

## 后端接口配置

项目已配置代理，将 `/api` 请求转发到后端服务：

- 开发环境: http://localhost:3301
- 生产环境: 根据实际部署配置

## 功能特性

✅ 已完成的功能：
- 用户注册/登录页面
- 路由守卫和权限控制
- 状态持久化（localStorage）
- 响应式设计和移动端适配
- 全局加载组件
- 错误处理和提示

## 下一步工作

1. 确保后端服务在 localhost:3301 正常运行
2. 安装项目依赖并启动开发服务器
3. 测试注册/登录功能与后端联调
4. 根据业务需求扩展更多功能模块
5. 优化性能和用户体验

## 常见问题

### Q: npm install 失败怎么办？
A: 尝试使用yarn或pnpm，或者按照上述权限解决方案操作。

### Q: 开发服务器无法启动？
A: 检查端口3000是否被占用，或修改vite.config.js中的端口配置。

### Q: 代理配置不生效？
A: 确保后端服务在localhost:3301正常运行，检查网络连接。