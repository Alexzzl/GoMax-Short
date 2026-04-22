# GoMax Short - 故障排除指南

本文档提供常见问题的诊断和解决方案。

## 安装包损坏问题

### 症状

Samsung Seller Office返回以下错误：
- `CRITICAL: Install error/Unable to download app. Package corrupted`
- `Package corrupted, please rebuild and resubmit your app`
- `Make sure the author certificate (.p12) is the same one used when the app was registered`

### 根本原因

1. **证书不匹配**: 使用了错误的.p12证书进行签名
2. **包损坏**: .wgt文件在构建或传输过程中损坏
3. **版本不一致**: config.xml版本与实际构建版本不匹配
4. **构建环境**: 使用了不干净的构建环境

### 解决方案

#### 步骤 1: 确认证书状态

```bash
# 检查Tizen CLI是否安装
tizen version

# 列出已配置的证书
tizen security-profiles list

# 如果证书丢失，重新添加
tizen security-profiles add -n YOUR_PROFILE_NAME -f /path/to/certificate.p12 -p YOUR_PASSWORD
```

#### 步骤 2: 清理构建环境

```bash
# 删除所有构建输出
rm -rf dist/ *.wgt node_modules/.vite

# 清理npm缓存
npm cache clean --force

# 重新安装依赖
npm install
```

#### 步骤 3: 验证配置文件

```bash
# 检查config.xml版本
grep 'version=' config.xml

# 验证package.json版本
grep '"version"' package.json

# 确保两个版本一致
```

#### 步骤 4: 重新构建

```bash
# 生成模拟数据
npm run generate:mock

# 构建生产版本
npm run build

# 验证构建输出
ls -la dist/
```

#### 步骤 5: 重新签名

```bash
# 使用正确的证书签名
tizen package -t wgt -s YOUR_CERTIFICATE_NAME -- dist/

# 验证生成的包
ls -lh *.wgt
tizen info GoMaxShort.wgt
```

### 预防措施

1. **证书备份**: 将.p12证书文件和密码安全备份到多个位置
2. **版本控制**: 确保config.xml和package.json版本保持一致
3. **构建环境**: 在干净的环境中构建，避免缓存问题
4. **文件验证**: 上传前验证.wgt文件大小（应该大于1MB）
5. **证书管理**: 使用版本控制系统记录证书配置（不存储实际证书文件）

## 证书丢失应急方案

### 如果原始证书无法恢复

1. **创建新应用ID**
   - 登录Samsung Seller Office
   - 创建新的应用ID
   - 生成新的.p12证书

2. **更新应用配置**
   ```xml
   <!-- config.xml -->
   <tizen:application id="NEW_APP_ID.GoMaxShort" package="NEW_PACKAGE_NAME" required_version="3.0"/>
   ```

3. **重新构建和签名**
   ```bash
   # 清理并重新构建
   rm -rf dist/ *.wgt
   npm run build
   
   # 使用新证书签名
   tizen package -t wgt -s NEW_CERTIFICATE_NAME -- dist/
   ```

4. **提交新应用**
   - 上传新的.wgt包
   - 重新完成认证流程
   - 更新所有相关文档

> **重要**: 新的应用ID意味着：
> - 现有用户需要重新下载应用
> - 用户数据可能丢失
> - 需要重新进行完整的测试流程

## 构建问题

### TypeScript 编译错误

```bash
# 查看详细错误信息
npm run build 2>&1 | grep error

# 清理TypeScript缓存
rm -rf node_modules/.cache

# 重新安装依赖
npm install
```

### 依赖问题

```bash
# 删除node_modules和lock文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果问题仍然存在，尝试清理npm缓存
npm cache clean --force
npm install
```

### Vite 配置问题

检查 `vite.config.ts` 中的配置：

```typescript
// 确保base路径正确
export default defineConfig({
  base: './', // 对于Tizen TV应用，使用相对路径
  // ...
});
```

## 遥控器操作问题

### 焦点无法移动

1. **检查HTML属性**
   ```html
   <!-- 确保交互元素有正确的属性 -->
   <button data-focusable="true" class="focusable">按钮</button>
   ```

2. **检查CSS样式**
   ```css
   /* 确保焦点样式可见 */
   .focused {
     outline: 3px solid #0078d4;
     background-color: rgba(0, 120, 212, 0.1);
   }
   ```

3. **检查JavaScript事件**
   ```javascript
   // 确保remote.ts中正确监听了按键事件
   document.addEventListener('keydown', handleRemoteControl);
   ```

### 返回键不工作

检查 `src/utils/remote.ts` 中的返回键处理：

```typescript
// 确保正确处理了Samsung TV的返回键
if (keyCode === 10009 || keyCode === 10182) {
  // 返回键或退出键处理逻辑
  handleBackKey();
}
```

## 视频播放问题

### 视频无法播放

1. **检查视频格式**
   - 确保使用MP4/H.264格式
   - 验证视频文件路径正确

2. **检查网络连接**
   ```javascript
   // 在浏览器中测试视频URL
   console.log('Testing video URL:', videoUrl);
   ```

3. **检查CORS设置**
   - 确保视频服务器允许跨域请求
   - 检查浏览器控制台是否有CORS错误

### 自动播放失败

```javascript
// 确保视频元素设置了正确的属性
<video
  autoPlay
  muted
  playsInline
  preload="auto"
/>
```

## 应用显示问题

### 白屏或黑屏

1. **检查config.xml格式**
   ```bash
   # 验证XML格式
   xmllint --noout config.xml
   ```

2. **检查文件路径**
   - 确保所有资源使用相对路径
   - 验证dist/目录包含所有必需文件

3. **查看错误日志**
   - 在Tizen Studio中查看控制台输出
   - 检查浏览器开发者工具

### 样式丢失

1. **检查CSS文件路径**
   ```html
   <!-- 确保CSS文件路径正确 -->
   <link rel="stylesheet" href="./styles/main.css">
   ```

2. **验证构建输出**
   ```bash
   # 检查dist目录中的CSS文件
ls -la dist/assets/*.css
   ```

## 性能问题

### 应用启动缓慢

1. **优化构建配置**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
         },
       },
     },
   });
   ```

2. **减少包大小**
   ```bash
   # 分析包大小
   npm install -g rollup-plugin-analyzer
   npm run build -- --analyze
   ```

### 内存泄漏

1. **清理事件监听器**
   ```typescript
   // 在组件卸载时清理事件监听器
   useEffect(() => {
     const handler = () => {};
     document.addEventListener('keydown', handler);
     
     return () => {
       document.removeEventListener('keydown', handler);
     };
   }, []);
   ```

2. **监控内存使用**
   - 使用Chrome DevTools的Memory面板
   - 检查内存泄漏模式

## 调试技巧

### 启用详细日志

```typescript
// 在开发环境中启用详细日志
if (import.meta.env.DEV) {
  console.log('Debug info:', {
    currentPage: window.location.hash,
    focusedElement: document.activeElement,
  });
}
```

### 远程调试

1. **启用Tizen远程调试**
   ```bash
   # 在电视上启用开发者模式
   # 通过IP地址连接到电视
   sdb connect TV_IP_ADDRESS
   ```

2. **使用Chrome DevTools**
   - 打开 `chrome://inspect`
   - 选择连接的Tizen设备
   - 开始远程调试

## 联系支持

如果以上解决方案都无法解决问题：

1. **收集信息**
   - 完整的错误日志
   - 构建环境详情
   - 证书配置状态
   - 重现步骤

2. **联系团队**
   - 开发团队: 提供技术细节
   - Samsung支持: 如果是平台问题
   - 证书管理员: 如果是证书问题

3. **文档更新**
   - 记录新的问题和解决方案
   - 更新相关文档
   - 分享给团队成员