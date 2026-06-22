# MU Idle Engine

MU Idle Engine 是一个静态网页放置游戏原型，数据主要位于 `Data/`，资源位于 `Assets/`，主入口是 `index.html`。

## 在线测试

推送到 GitHub 后，可通过 GitHub Pages 远程测试：

1. 打开 GitHub 仓库的 `Settings`。
2. 进入 `Pages`。
3. `Build and deployment` 选择 `GitHub Actions`。
4. 推送 `main` 分支后，等待 `Deploy MU Idle to GitHub Pages` 工作流完成。
5. 在 Pages 页面获取测试地址。

## 本地启动

双击：

```text
Start-MU-Idle.cmd
```

或运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-MU-Idle.ps1
```

## 资源编辑器

双击：

```text
Start-MU-Idle-Studio.cmd
```

或访问本地 Studio 服务地址，例如：

```text
http://127.0.0.1:8790/studio.html
```

## 数据目录

- `Data/Item/`：装备、首饰、宝石、守护物、套装、词条
- `Data/Monster/`：怪物、刷新、掉落
- `Data/Map/`：地图区域
- `Data/Character/`：角色、技能、等级经验、公式
- `Data/Config/`：战斗、掉落、离线、拾取等参数

## 注意

GitHub Pages 是纯静态托管，远程测试版可以运行游戏，但不能直接保存服务器文件。需要修改数据库时，请在本地使用 MU Idle Studio 编辑并保存后再提交到仓库。
