# Samsung TV Seller Office 重新提审指南

本文档基于以下内容整理：

- `GoMax Short` 的驳回邮件
- Samsung 模板文件 `App_Description_template_eng_v.1.42.pptx`
- 当前工作区中的应用结构

## Samsung 驳回了什么

Samsung 驳回这次提交的原因是：`Application UI Description` 文件内容不完整。

驳回中的原始问题描述是：

`CRITICAL: Description file incomplete. Please add app key policy to the description file.`

这意味着这次主要修复点不只是代码。真正的关键问题，是你在 Seller Office 上传的 PPT 说明文档不完整。

## 非常重要的打包提醒

本地源码文件 [config.xml](E:/code/workspace/GoMaxShort/config.xml) 已经是 `version="1.0.3"`。

当前目录中没有找到已构建的 `.wgt` 安装包。

你需要在重新提审前重新构建并重新签名一个新的安装包。

## 已从 Samsung PPT 模板确认的页面结构

模板中的页面依次为：

1. `Guide`
2. `(App_name) Description`
3. `Revision History`
4. `Contents`
5. `UI Structure`
6. `UI structure - sample1(flow graph)`
7. `UI Structure - sample2(depth navi.)`
8. `Usage Scenario`
9. `Usage Scenario - sample`
10. `Menu & function description`
11. `Key Policy - sample`
12. `How to change languages`

## 如何填写这份 PPT

### 第 1 页

提交前删除这一页。

### 第 2 页

把占位内容替换为：

- 标题：`GoMax Short Description`
- 公司名称：使用你在 Seller Office 里的真实卖家名或公司名

### 第 3 页

为这次重新提审新增一条修订记录。

建议内容：

- 日期：`2026-04-14`
- 版本：`V1.0.3`
- 描述：`Fixed package corruption issue and certificate mismatch. Rebuilt and re-signed application package with correct certificate.`
- 编写者：你的姓名或团队名称

### 第 4 页

目录页要和最终 PPT 的实际内容保持一致。

建议目录如下：

- UI Structure
- Usage Scenario
- Menu & Function Description
- Key Policy
- How to Change Languages

### 第 5 页

这一页作为应用实际的 UI 结构页使用。

`GoMax Short` 建议结构如下：

```text
Home
|- Discover
|- Detail
|  |- Player
|- My List / Watch History
|- Categories
```

你也可以画成下面这种流程形式：

```text
Home -> Discover -> Detail -> Player
Home -> Detail -> Player
Home -> My List
Home -> Categories
Detail -> Related Dramas -> Detail
Player -> Episode List -> Player
```

### 第 6 页和第 7 页

这两页是示例页。

如果你已经在第 5 页填好了你自己的真实 UI 结构，这两页可以删除。

### 第 8 页

描述从应用启动到视频播放的完整使用流程。

建议文字如下：

```text
1. 用户从 Samsung TV Apps 启动应用。
2. 应用会短暂显示加载页。
3. 用户进入 Home 页面。
4. 在 Home 页面中，用户可以通过遥控器移动焦点并选择：
   - Featured content
   - Episodes / Discover entry
   - More Like This entry
5. 用户可以打开 Discover 页面浏览：
   - Browse by Category
   - Trending Now
   - Quick Watch
   - New Releases
6. 用户选择某个短剧标题后，进入 Detail 页面。
7. 在 Detail 页面中，用户可以：
   - 查看剧情简介
   - 查看剧集信息
   - 浏览分集列表
   - 添加/取消收藏
   - 打开相关短剧
8. 用户选择 Play 或某一集卡片后，进入 Player 页面。
9. 在 Player 页面中，用户可以：
   - 播放/暂停视频
   - 切换上一集/下一集
   - 后退 10 秒
   - 前进 10 秒
   - 静音/取消静音
   - 从右侧分集列表中选择其他剧集
10. 已播放内容会记录到观看历史中。
11. 用户可以从顶部导航打开 My List / Watch History。
12. 用户可以从顶部导航打开 Categories，并按分类浏览短剧内容。
```

这一页有几个重要注意点：

- 不要提到登录、激活、订阅或支付，因为当前应用并没有实现这些功能。
- 不要声称支持 trailer 播放或 share 功能，因为当前 UI 虽然有这些元素，但逻辑并没有完整实现。

### 第 9 页

这是 Samsung 提供的示例页。

提交前删除。

### 第 10 页

使用真实应用截图，并为每个主要页面补充简短的功能说明。

建议截图集合：

- Home
- Discover
- Detail
- Player
- Watch History
- Categories

建议描述如下：

#### Home

```text
应用主入口页面。
用户可以浏览推荐剧集，并进入内容发现流程。
通过遥控器方向键移动焦点，按 ENTER 打开当前选中项。
```

#### Discover

```text
用于浏览短剧内容的发现页。
用户可以浏览分类、热门内容、快速观看内容以及最新发布内容。
所有内容均可免费观看。
```

#### Detail

```text
短剧详情页。
用户可以查看剧情简介和剧集信息、浏览分集、打开相关短剧，并添加或移除收藏。
```

#### Player

```text
视频播放页面。
用户可以播放或暂停视频、快进或快退、切换上一集或下一集、静音，以及从分集列表中选择其他剧集。
```

#### Watch History

```text
显示已观看短剧和剧集的历史记录页面。
用户可以从观看历史中重新打开某个标题。
```

#### Categories

```text
分类浏览页面。
用户可以按短剧分类浏览内容，并从分类卡片中打开相应标题。
```

### 第 11 页

这是本次驳回最关键的一页。

Samsung 模板中的说明是：

`If you have your own key policy on your app, please describe it.`

对于 `GoMax Short`，请使用应用当前真实的遥控器行为。建议表格内容如下：

| Button | Action | Remarks |
| --- | --- | --- |
| ENTER / OK | 选择当前焦点上的项目或按钮 | 整个应用通用 |
| UP / DOWN | 向上或向下移动焦点 | 整个应用通用 |
| LEFT / RIGHT | 向左或向右移动焦点 | 整个应用通用 |
| RETURN | 返回上一页 | Samsung Mandatory |
| EXIT | 关闭应用并返回电视直播频道 | Samsung Mandatory |
| PLAY | 在 Player 页面开始播放或恢复播放 | 仅 Player 页面 |
| PAUSE | 在 Player 页面暂停播放 | 仅 Player 页面 |
| FAST FORWARD | 快进 10 秒 | 仅 Player 页面 |
| REWIND | 快退 10 秒 | 仅 Player 页面 |
| MUTE | 通过电视遥控器行为进行静音或取消静音 | TV remote behavior |
| Ch. Up / Down | 不使用 | N/R |
| YELLOW | 不使用 | N/R |
| RED / GREEN / BLUE | 不使用 | N/R |
| Number keys | 不使用 | N/R |

你也可以在表格上方或下方加入这段简短说明：

```text
This app uses standard Samsung TV remote navigation. Users move focus with arrow keys and press ENTER/OK to select. RETURN moves to the previous page and EXIT closes the application. On the Player page, PLAY/PAUSE, FAST FORWARD, and REWIND are supported for playback control.
```

### 第 12 页

如果应用不支持应用内语言切换，就直接明确写出来。

建议文字如下：

```text
This app currently provides English UI content only.
There is no in-app menu for changing the application language.
If the TV system language is changed, the app still displays its built-in English UI.
```

如果你后续增加了多语言 UI，再把这一页改成真实的切换步骤即可。

## 已从当前项目确认的应用行为

下面这些行为都已经存在于应用中，因此可以安全写进 PPT：

- 顶部导航包含 `Home`、`Discover`、`My List` 和 `Categories`
- 详情页包含简介、剧集信息、分集列表、相关短剧和收藏切换
- 播放页支持播放/暂停、上一集/下一集、快退/快进、静音和分集列表
- 支持观看历史记录
- 已处理的遥控器按键包括 `ENTER`、方向键、`RETURN`、`EXIT`、`PLAY`、`PAUSE`、`FAST FORWARD` 和 `REWIND`

## 不要在 PPT 中夸大描述的功能

下面这些 UI 元素虽然视觉上存在，但除非你先把功能真正实现完整，否则不要在 PPT 里描述为“已支持”：

- `Trailers`
- `Share`

## 重新提审检查清单

1. 使用 Samsung 模板更新 PPT。
2. 删除不属于最终文档的 guide 页和 sample 页。
3. 确保第 11 页包含 `Key Policy`。
4. 将 PPT 保存为最终的 Application UI Description 文件。
5. 重新构建 Tizen 安装包，确保打包后的 `config.xml` 版本确实是 `V1.0.3`。
6. 对新的安装包重新签名。
7. 在 Seller Office 上传新的 `wgt` 和新的 PPT。
8. 补充一段简短的 defect response note。

建议回复说明如下：

```text
We updated the Application UI Description using the Samsung template.
We added the App Key Policy and updated the UI structure, usage scenario, and menu/function description to match the current app.
We also uploaded a new application package version V1.0.3 for resubmission.
```

## 解决安装包损坏/证书问题

### 问题诊断

当Samsung Seller Office返回以下错误时：
- `CRITICAL: Install error/Unable to download app. Package corrupted`
- `Package corrupted, please rebuild and resubmit your app`
- `Make sure the author certificate (.p12) is the same one used when the app was registered`

这通常表示：
1. 安装包(.wgt)文件已损坏
2. 使用了错误的证书进行签名
3. 证书与注册应用时使用的证书不匹配

### 解决方案

#### 1. 确认证书可用性
```bash
# 查找项目中的证书文件
find . -name "*.p12" -o -name "*certificate*"
```

如果找不到证书：
- 联系开发团队获取原始.p12证书文件
- 确保证书密码可用
- 如果证书丢失，需要创建新的应用ID

#### 2. 重新构建应用
```bash
# 清理之前的构建文件
rm -rf dist/ *.wgt

# 生成模拟数据并构建
npm run generate:mock
npm run build

# 验证config.xml版本
grep 'version=' config.xml
```

#### 3. 使用Tizen CLI打包
```bash
# 检查Tizen CLI是否安装
tizen version

# 创建未签名的包
tizen package -t wgt -- dist/

# 使用正确的证书签名（替换YOUR_CERTIFICATE_NAME）
tizen package -t wgt -s YOUR_CERTIFICATE_NAME -- dist/
```

#### 4. 验证生成的包
```bash
# 检查.wgt文件是否生成
ls -la *.wgt

# 验证包信息
tizen info GoMaxShort.wgt
```

### 预防措施

1. **证书备份**: 将.p12证书文件和密码安全备份
2. **版本一致性**: 确保config.xml版本号与package.json保持一致
3. **构建环境**: 在干净的环境中重新构建，避免缓存问题
4. **文件完整性**: 上传前验证.wgt文件大小和完整性

### 如果证书丢失

如果原始证书已丢失且无法恢复：

1. 在Samsung Seller Office创建新的应用ID
2. 生成新的.p12证书
3. 更新应用配置以使用新的应用ID
4. 重新完成整个认证流程
5. 确保妥善备份新的证书文件和密码

> **重要**: 新的应用ID意味着用户需要重新下载安装应用，原有用户数据可能丢失。
