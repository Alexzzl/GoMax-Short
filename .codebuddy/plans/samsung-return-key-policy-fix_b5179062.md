---
name: samsung-return-key-policy-fix
overview: 修复三星 Return Key Policy 合规问题：在首页按返回键时显示退出确认弹窗（而非无响应或直接退出），确认后才调用 tizen.application.getCurrentApplication().exit()
design:
  architecture:
    framework: react
  styleKeywords:
    - Dark Theme
    - Smart TV UI
    - Minimal Dialog
    - High Contrast
    - Focus-Driven Navigation
  fontSystem:
    fontFamily: Roboto
    heading:
      size: 28px
      weight: 600
    subheading:
      size: 18px
      weight: 400
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#F48739"
      - "#E67530"
      - "#D66A25"
    background:
      - rgba(0, 0, 0, 0.85)
      - "#1E1E1E"
    text:
      - "#FFFFFF"
      - "#B0B0B0"
    functional:
      - "#2A2A2A"
      - "#4CAF50"
      - "#F44336"
todos:
  - id: modify-use-remote-control
    content: 修改 useRemoteControl hook：扩展参数支持 canGoBack 和 onShowExit 回调，重写 back/escape/exit 键分支逻辑
    status: completed
  - id: add-exit-modal-component
    content: 在 App.tsx 中新增 ExitConfirmationModal 组件：包含遮罩层、对话框标题/描述、Cancel/Exit 按钮，支持遥控器聚焦导航
    status: completed
    dependencies:
      - modify-use-remote-control
  - id: integrate-exit-state
    content: 在 App 主组件中集成退出确认状态管理和弹窗挂载：添加 showExitConfirm state、计算 canGoBack、连接 handleKeyDown 与弹窗显隐
    status: completed
    dependencies:
      - add-exit-modal-component
  - id: add-modal-focus-handling
    content: 实现弹窗焦点管理与返回键关闭逻辑：限制焦点在弹窗按钮内、弹窗打开时 auto-focus Cancel 按钮、Back 键关闭弹窗
    status: completed
    dependencies:
      - integrate-exit-state
  - id: verify-build-and-test
    content: 构建验证：运行 vite build 确认无编译错误，检查 dist 输出包含完整修改
    status: completed
    dependencies:
      - add-modal-focus-handling
---

## Product Overview

修复三星智能电视应用提交被拒问题：Return Key Policy 未遵循。需要正确实现 Exit 和 Return 功能，使应用符合三星 Tizen 应用审核要求。

## Core Features

- **子页面返回行为**（detail/player/discover/history/settings）：单击 Return/Exit 键导航回上一页（已有，保持不变）
- **首页退出确认弹窗**：在 home 页面单击 Return/Exit 键时，显示退出确认对话框（**核心缺失功能**）
- **退出确认流程**：弹窗提供 Cancel 和 Exit 两个按钮；用户点击 Exit 后调用 `tizen.application.getCurrentApplication().exit()` 终止应用
- **弹窗内返回键处理**：退出确认弹窗打开时，按 Return 键关闭弹窗回到首页
- **Tizen API 安全调用**：使用类型安全方式访问 `tizen` 全局对象，非 Tizen 环境下优雅降级

## 问题根因分析

1. 当前 `useRemoteControl` hook 中，`back`(10009) / `escape`(27) 键直接调用 `onBackRef.current()` → 在首页时 `goBack()` 因 pageStack 为空而什么都不做（无响应）
2. 当前 `exit`(10182) 键直接调用 `exitTizenApp()` 退出应用 → 跳过了确认步骤
3. 完全缺少退出确认弹窗 UI 组件

## Tech Stack

- 前端框架：React + TypeScript（已有）
- 样式方案：CSS 自定义属性 + CSS 文件（与项目现有模式一致）
- 构建工具：Vite（已有）

## Implementation Approach

### 策略概述

采用**最小侵入性修改**策略，仅在 `src/App.tsx` 中完成所有改动：

1. 新增 `showExitConfirm` state 控制弹窗显隐
2. 修改 `useRemoteControl` hook 的 back/escape/exit 按键处理逻辑：根据当前页面和 pageStack 状态决定行为
3. 新增 `ExitConfirmationModal` React 组件渲染退出确认弹窗

### 关键技术决策

**决策 1：页面状态判断逻辑**

```
按 Return 键时的判断条件:
- pageStack 不为空 → 执行 goBack()（有历史记录可回退）
- pageStack 为空且 currentPage === "home" → 显示退出确认弹窗
- pageStack 为空但 currentPage !== "home" → 导航到 home（安全兜底）
```

理由：使用 pageStack 是否为空而非仅判断 currentPage === "home"，因为 discover/settings 等页面可能通过 nav 切换而非 push 导致 pageStack 也为空。

**决策 2：Exit 键(10182) 与 Back 键(10009) 统一处理**
将 exit 键也走相同的判断逻辑（先尝试返回，首页则弹确认框），而不是直接退出。理由：三星文档明确说明长按 Exit 是系统强制的，开发者只需处理单击事件。

**决策 3：弹窗实现为 React 内联组件**
不创建独立文件，而是将 `ExitConfirmationModal` 作为 App.tsx 内部的函数组件。理由：该组件仅在 App.tsx 中使用一次，且需要共享 KEY_CODES、exitTizenApp 等模块级定义。

### 实现细节

#### 文件修改清单

**`src/App.tsx`** [MODIFY] - 主要修改文件

- **新增 state**：`const [showExitConfirm, setShowExitConfirm] = useState(false)`
- **新增回调**：`const handleExitConfirm = () => { setShowExitConfirm(false); exitTizenApp(); }`
- **修改 useRemoteControl 调用签名**：传入 `routeState`（或 isHomePage + canGoBack）用于按键判断
- **修改 handleKeyDown 中的 back/escape/exit 分支**：

```typescript
case KEY_CODES.back:
case KEY_CODES.escape:
case KEY_CODES.exit:
if (canGoBack) {
onBackRef.current(); // 有历史记录，正常返回
} else {
showExitConfirmation(); // 首页，弹出退出确认
}
break;
```

- **新增 ExitConfirmationModal 组件**：
- 全屏半透明遮罩（rgba(0,0,0,0.8)）+ 居中卡片
- 使用 CSS 变量保持视觉一致性（--bg-card, --primary-color, --text-primary 等）
- Cancel 按钮（灰色背景）+ Exit 按钮（主色背景）
- 两按钮均支持遥控器聚焦（data-focusable="true"）
- z-index 设为 9999（与 loading-page 一致）
- **JSX 中挂载弹窗**：`{showExitConfirm ? <ExitConfirmationModal ... /> : null}`

**`useRemoteControl` hook 签名变更**
当前：`useRemoteControl(currentPage: AppPage, onBack: () => void)`
变更为：`useRemoteControl(currentPage: AppPage, onBack: () => void, canGoBack: boolean, onShowExit: () => void)`

`canGoBack` 由 App 组件通过 `routeState.pageStack.length > 0` 计算得出并传入。

#### 弹窗交互细节

- 打开弹窗时自动聚焦到 Cancel 按钮
- 弹窗内按 Back 键关闭弹窗（通过监听 remote-key 或在 handleKeyDown 中检测弹窗状态）
- 点击 Cancel 关闭弹窗
- 点击 Exit 调用 `exitTizenApp()` 后关闭弹窗

### Architecture Design

```
用户按 Return/Exit 键
    │
    ▼
useRemoteControl.handleKeyDown()
    │
    ├─ pageStack 不为空? ──→ onBack() ──→ goBack() 返回上一页
    │
    └─ pageStack 为空? ──→ setShowExitConfirm(true)
                              │
                              ▼
                    ExitConfirmationModal 渲染
                              │
                    ├─ Cancel → setShowExitConfirm(false)
                    ├─ Back键 → setShowExitConfirm(false)
                    └─ Exit → exitTizenApp() → tizen.application.getCurrentApplication().exit()
```

## Directory Structure

```
e:\code\workspace\GoMaxShort\
├── src/
│   ├── App.tsx                          # [MODIFY] 核心修改：添加退出确认弹窗组件 + 修改返回键处理逻辑
│   ├── core/
│   │   └── app-state.ts                 # [NO CHANGE] 路由状态管理不变，goBack 逻辑已正确处理空栈
│   └── styles/
│       └── react-overrides.css          # [NO CHANGE] 或可选地添加 .exit-confirm-modal 样式（也可内联）
├── css/
│   └── common.css                       # [NO CHANGE] 已有足够 CSS 变量和 z-index 参考
```

## Implementation Notes (Execution Details)

- **性能**：弹窗使用条件渲染（showExitConfirm 时才挂载），不影响正常使用时的 DOM 大小。弹窗内的 keydown 监听需在 useEffect 中注册/注销
- **向后兼容**：子页面的返回行为完全不变；仅在首页增加弹窗确认步骤
- **焦点管理**：弹窗打开时需限制焦点在弹窗的两个按钮间切换，避免背景元素获得焦点
- **z-index 冲突避免**：loading-page 使用 z-index: 9999，退出弹窗使用相同层级即可（二者互斥不会同时出现）
- **Tizen 类型安全**：复用已有的 `exitTizenApp` 函数（第1462-1474行），不做修改

## 设计概述

退出确认弹窗采用三星智能电视风格的深色主题设计，与应用整体 UI 保持一致。

### 页面规划

仅需设计 1 个屏幕：**退出确认弹窗（Exit Confirmation Modal）**

### 单页块设计

**块 1 - 全屏遮罩层（Overlay Background）**

- 半透明黑色背景（rgba(0, 0, 0, 0.85)），覆盖整个视口
- 用于模糊化背景内容，突出弹窗主体
- 固定定位，z-index 9999

**块 2 - 退出确认对话框（Dialog Card）**

- 居中显示的圆角卡片，使用 --bg-card (#1E1E1E) 背景
- 包含标题文字 "Exit Application"
- 包含描述文字 "Are you sure you want to exit GoMax Short?"
- 卡片带有微妙的边框高亮（使用 --primary-color #F48739），提升视觉层次感

**块 3 - 操作按钮组（Action Buttons）**

- 水平排列的两个按钮：Cancel（左）和 Exit（右）
- Cancel 按钮：使用 --bg-hover (#2A2A2A) 背景，--text-primary 白色文字
- Exit 按钮：使用 --primary-color (#F48739) 背景，白色文字，作为主要操作按钮
- 按钮支持 focused 态（与全局 focused 类一致）
- 按钮间距 20px，最小宽度 120px