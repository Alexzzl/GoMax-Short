# GoMax Short - Samsung Tizen TV 流媒体应用构建指南

## 项目结构

```
GoMaxShort/
├── config.xml          # Tizen 应用配置文件
├── index.html          # 主入口页面
├── src/
│   ├── main.tsx        # React 应用入口
│   ├── App.tsx         # 应用主体和路由
│   ├── types/          # TypeScript 类型定义
│   ├── data/           # 模拟数据
│   ├── components/     # React 组件
│   ├── pages/          # 页面组件
│   ├── hooks/          # React hooks
│   └── styles/         # CSS 样式文件
├── public/             # 静态资源
├── vite.config.ts      # Vite 配置文件
├── package.json        # 依赖配置
└── README.md           # 项目说明
```

## 环境准备

### 1. 安装 Node.js 和 npm

- Node.js 18+ (推荐 LTS 版本)
- npm 包管理器

### 2. 安装 Tizen Studio

下载地址：https://developer.tizen.org/development/tizen-studio/download

### 3. 安装所需组件

- Tizen Studio
- Web IDE
- Samsung TV 扩展组件

### 4. 安装项目依赖

```bash
npm install
```

## 构建步骤

### 方式一：Vite 构建 + Tizen 打包 (推荐)

1. **构建前端应用**

   ```bash
   # 安装依赖
   npm install

   # 生成模拟数据
   npm run generate:mock

   # 构建生产版本
   npm run build
   ```
2. **准备 Tizen 项目文件**

   - 确保 `config.xml` 文件在项目根目录
   - 构建输出将在 `dist/` 目录
3. **使用 Tizen Studio 创建项目**

   - 打开 Tizen Studio
   - 文件 → 新建 → Tizen 项目
   - 选择 "模板" → "TV" → "Web 应用"
   - 选择空项目
4. **导入构建文件**

   - 用 `dist/` 目录内容替换默认文件
   - 将 `dist/` 中的所有文件复制到 Tizen 项目根目录
5. **构建安装包**

   - 右键项目 → 构建安装包
   - 选择 "构建"（不是"构建签名安装包"）
   - 输出：`GoMaxShort.wgt`

### 方式二：使用 CLI (命令行)

```bash

tizen security-profiles list
Loaded in 'C:\tizen-studio-data\profile\profiles.xml'.
[Profile Name]      [Active]  
ursulinaepzmi51
SamsungTV           O


# 构建前端应用
npm run build

# 进入 dist 目录
cd dist

# 使用 Tizen CLI 创建并签名 wgt 安装包
tizen package -t wgt -s ursulinaepzmi51 -- .
```

### 方式三：使用 CLI 直接打包

1. **构建应用**

   ```bash
   npm run build
   ```
2. **使用 Tizen CLI 打包并签名**

   ```bash
   # 从项目根目录执行（推荐）
   # 注意：-s 参数后的证书名称必须与注册应用时使用的证书一致
   tizen package -t wgt -s YOUR_CERTIFICATE_NAME -- dist
   ```
3. **输出文件**

   - 生成的 WGT 文件将位于项目根目录
   - 文件名为 `GoMaxShort.wgt`
   - 验证文件大小（应该大于0）

### 证书配置验证

在打包前，确保Tizen CLI已正确配置证书：

```bash
# 列出已配置的证书
tizen security-profiles list

# 如果证书未配置，添加证书
tizen security-profiles add -n YOUR_PROFILE_NAME -f /path/to/certificate.p12 -p YOUR_PASSWORD

# 验证证书信息
tizen security-profiles list YOUR_PROFILE_NAME
```

### 包完整性验证

打包完成后，验证生成的.wgt文件：

```bash
# 检查文件大小
ls -lh *.wgt

# 验证包信息
tizen info GoMaxShort.wgt

# 检查包内容
tizen package -l GoMaxShort.wgt
```

## 三星电视测试

### 1. 开启电视开发者模式

1. 进入三星电视设置
2. 找到 "开发者模式"（隐藏菜单）
3. 启用开发者模式
4. 记录电视 IP 地址
5. 确保电视和开发电脑在同一网络

### 2. 通过 Tizen Studio 安装

1. 在 Tizen Studio 中，打开 "连接浏览器"
2. 通过 IP 地址添加电视
3. 右键项目 → 运行 → 以 Tizen Web 应用运行
4. 选择你的电视

### 3. 应用功能测试

- **遥控器导航**：测试方向键、确认键、返回键操作
- **视频播放**：测试视频播放、暂停、下一集自动播放
- **路由切换**：测试各页面间的导航
- **焦点管理**：确保所有交互元素都有正确的焦点样式

## 应用功能

### 导航操作

- **方向键**：在元素间移动焦点
- **确认键**：选择/确认操作
- **返回键**：返回上一页面或关闭弹窗
- **彩色键**：快速访问功能（红/绿/蓝/黄）

### 页面功能

- **首页**：热门剧集、推荐内容、快速访问
- **发现页**：剧集分类浏览、搜索功能
- **详情页**：剧集信息、分集列表、播放控制
- **播放器**：视频观看、自动播放下一集
- **我的列表**：观看历史记录
- **分类页**：按类型浏览剧集

### 技术特性

- **响应式设计**：适配 1920x1080 分辨率
- **TV 优化**：专为电视遥控器操作设计
- **路由系统**：Hash-based 路由，兼容 Tizen TV
- **焦点管理**：智能焦点导航系统
- **视频播放器**：HTML5 视频，支持自动播放

## 常见问题

### WGT 无法安装

- 确保电视和电脑在同一网络
- 检查开发者模式是否已开启
- 验证电视 IP 地址是否正确
- 检查 Tizen Studio 中的设备连接状态

### 安装包损坏/证书错误

当Samsung Seller Office返回以下错误时：

- `CRITICAL: Install error/Unable to download app. Package corrupted`
- `Package corrupted, please rebuild and resubmit your app`
- `Make sure the author certificate (.p12) is the same one used when the app was registered`

**解决方案:**

1. **确认证书可用性**

   ```bash
   # 查找项目中的证书文件
   find . -name "*.p12" -o -name "*certificate*"
   ```
2. **重新构建应用**

   ```bash
   # 清理之前的构建
   rm -rf dist/ *.wgt

   # 重新构建
   npm run generate:mock
   npm run build

   # 验证版本号
   grep 'version=' config.xml
   ```
3. **重新签名安装包**

   ```bash
   # 使用正确的证书签名（替换YOUR_CERTIFICATE_NAME）
   tizen package -t wgt -s YOUR_CERTIFICATE_NAME -- dist/
   ```
4. **验证生成的包**

   ```bash
   # 检查文件大小（应该不是0）
   ls -la *.wgt

   # 验证包信息
   tizen info GoMaxShort.wgt
   ```

### 应用无法显示

- 检查 config.xml 是否为有效 XML 格式
- 确保所有文件路径正确（使用相对路径）
- 查看 Tizen Studio 控制台错误信息
- 验证构建输出 dist/ 目录包含所有必需文件

### 遥控器无法操作

- 检查 `data-focusable="true"` 属性是否正确设置
- 先用键盘测试（方向键 + 确认键）
- 检查 `.focused` 类样式是否可见
- 验证 `remote.ts` 中的事件监听器

### 视频播放问题

- 检查视频格式兼容性（MP4/H.264）
- 验证视频文件路径是否正确
- 检查网络连接和流媒体服务器状态
- 查看浏览器控制台是否有 CORS 错误

### 构建问题

- **TypeScript 编译错误**：运行 `npm run build` 查看详细错误
- **依赖问题**：删除 node_modules 并重新运行 `npm install`
- **Vite 配置问题**：检查 vite.config.ts 中的 base 路径设置

## 发布到三星电视商店

1. **创建三星开发者账号**

   - 访问 Samsung Developer Portal
   - 注册并验证开发者账号
2. **准备发布包**

   - 使用已签名的 WGT 安装包
   - 准备应用截图和描述
   - 确保符合 Samsung TV App 质量要求
3. **提交应用**

   - 上传 WGT 安装包
   - 填写应用信息和元数据
   - 提交审核
4. **重新提审（被驳回后）**

   - **证书问题**: 必须使用注册应用时相同的.p12证书
   - **版本更新**: 确保config.xml中的版本号已更新
   - **重新构建**: 清理并重新构建整个应用
   - **重新签名**: 使用正确的证书重新签名
   - **验证包完整性**: 检查.wgt文件大小和完整性

## What's new in this version

**Enhanced Return Key Policy Implementation**

- Fixed critical Samsung TV compliance issue with proper Return/Exit key handling
- Added exit confirmation dialog when pressing Return/Exit key from home screen
- Return/Exit key now properly navigates back from detail/player pages
- Improved navigation flow with better focus management and page stack handling
- Enhanced user experience with proper TV remote control interactions

**Technical Improvements**

- Updated remote control module with Samsung TV development guidelines compliance
- Added proper tizen.application.getCurrentApplication().exit() API integration
- Improved focus history management for better navigation experience
- Enhanced modal dialog system with TV-optimized keyboard navigation

## Note for Tester (include what's new)

**Critical Testing Requirements for Samsung TV Compliance:**

1. **Return/Exit Key Policy Testing:**

   - Test Return/Exit key from home screen → should show exit confirmation dialog
   - Test Return/Exit key from other pages → should navigate back to previous page
   - Test Return/Exit key in exit confirmation dialog → should close dialog and return to app
   - Test confirming exit in dialog → should properly terminate application
2. **Navigation Flow Testing:**

   - Verify proper page stack management during navigation
   - Test focus restoration after using Return key
   - Verify exit confirmation dialog can be navigated with remote control
   - Test all navigation paths: Home → Detail → Player → Back navigation
3. **Remote Control Integration:**

   - Test all directional keys for focus navigation
   - Verify ENTER key functionality for selections
   - Test BACK and EXIT key codes (10009 and 10182 respectively)
   - Verify focus highlighting is visible and responsive

**Samsung TV Guidelines Compliance:**
This update specifically addresses the CRITICAL return key policy requirement from Samsung's application termination guidelines. The app now properly implements:

- Exit confirmation dialog on home screen Return/Exit key press
- Proper navigation stack management for Return/Exit key functionality
- Return/Exit keys follow the same policy (no separate long-press detection as per Samsung requirements)
- Correct tizen.application.getCurrentApplication().exit() API usage

Please verify that the application meets all Samsung TV development fundamentals for application termination and user interface guidelines.
4. **等待审批**

- 审核周期通常 1-2 周
- 根据反馈进行必要的修改

## 证书管理

### 重要提醒

Samsung TV应用发布对证书有严格要求：

1. **证书一致性**: 必须使用注册应用ID时相同的.p12证书
2. **证书备份**: 妥善保管.p12文件和密码，丢失后无法恢复
3. **证书安全**: 不要将证书文件提交到版本控制系统

### 证书位置

- 证书文件通常存储在安全位置，不在项目目录中
- 联系开发团队获取正确的证书文件
- 确保证书密码可用

### 证书验证

```bash
# 验证证书是否可用
tizen security-profiles list

# 添加证书（如果需要）
tizen security-profiles add -n YOUR_PROFILE_NAME -f /path/to/certificate.p12 -p YOUR_PASSWORD
```

### 如果证书丢失

如果原始证书丢失且无法恢复：

1. 在Samsung Seller Office创建新的应用ID
2. 生成新的.p12证书
3. 更新config.xml中的应用ID
4. 重新完成整个认证流程
5. 妥善备份新的证书文件和密码

> **警告**: 新的应用ID意味着现有用户需要重新下载应用，原有用户数据可能丢失。

## 注意事项

- 本项目使用 Vite + React + TypeScript 构建
- 适配 1920x1080 分辨率（Full HD）
- 专为三星电视遥控器操作优化
- 实现了完整的焦点管理系统
- 使用 Hash-based 路由确保 TV 兼容性
- 构建目标设置为 ES2015 以支持旧版 Chromium
- 所有资源使用相对路径确保 TV 部署正确
- 应用包含模拟数据生成脚本，构建前会自动运行
- **证书管理**: 确保使用正确的.p12证书进行签名，避免包损坏问题
