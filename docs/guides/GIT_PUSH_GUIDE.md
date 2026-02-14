# Git推送指南

## 本地仓库已准备完成 ✅

- ✅ 已创建.gitignore文件
- ✅ 已提交所有代码
- ✅ 当前分支：master
- ✅ 工作区干净

## 接下来的步骤

### 选项1：推送到GitHub

1. **在GitHub上创建新仓库**
   - 访问：https://github.com/new
   - 仓库名称：`Sanguo_html` 或 `sanguo-strategy-game`
   - 描述：三国志HTML5策略游戏
   - 选择：Public 或 Private
   - **不要**勾选"Initialize with README"（我们已有代码）
   - 点击"Create repository"

2. **添加远程仓库并推送**（GitHub创建后会显示这些命令）
   ```bash
   # 方式A：HTTPS（推荐，简单）
   git remote add origin https://github.com/你的用户名/Sanguo_html.git
   git branch -M main
   git push -u origin main

   # 方式B：SSH（如果已配置SSH密钥）
   git remote add origin git@github.com:你的用户名/Sanguo_html.git
   git branch -M main
   git push -u origin main
   ```

### 选项2：推送到Gitee（码云）

1. **在Gitee上创建新仓库**
   - 访问：https://gitee.com/projects/new
   - 仓库名称：`Sanguo_html`
   - 选择：公开/私有
   - 不勾选"使用Readme文件初始化"
   - 点击"创建"

2. **添加远程仓库并推送**
   ```bash
   git remote add origin https://gitee.com/你的用户名/Sanguo_html.git
   git push -u origin master
   ```

### 选项3：推送到其他平台

**GitLab / Bitbucket / 其他**，步骤类似：
1. 在平台上创建新仓库
2. 复制平台提供的远程仓库地址
3. 运行命令：
   ```bash
   git remote add origin <远程仓库URL>
   git push -u origin master
   ```

## 快速命令模板

### 如果您的远程仓库地址是（请替换实际地址）：

```bash
# 1. 添加远程仓库
git remote add origin <您的远程仓库URL>

# 2. 查看远程仓库（验证）
git remote -v

# 3. 推送代码
git push -u origin master

# 或者如果需要重命名分支为main
git branch -M main
git push -u origin main
```

## 后续推送

首次推送后，以后只需：
```bash
git add .
git commit -m "更新说明"
git push
```

## 如果遇到问题

### 问题1：需要改分支名为main
```bash
git branch -M main
git push -u origin main
```

### 问题2：推送被拒绝（远程有内容）
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### 问题3：需要身份验证
- HTTPS：输入用户名和密码/token
- SSH：需要先配置SSH密钥

---

## 当前项目信息

- **项目名称**：三国志策略游戏
- **技术栈**：HTML5, CSS3, JavaScript ES6+
- **文件数量**：约15个
- **代码行数**：约2500行
- **开发阶段**：阶段2完成（基础架构+核心系统）

---

**请告诉我您要使用哪个平台（GitHub/Gitee/其他），我可以提供更具体的命令！**
