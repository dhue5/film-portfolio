# Film Portfolio — 极光·空间计算风格个人网站

苹果「空间计算」美学 + Bento Grid 布局的个人短片作品集。

## 图片素材用途

| 文件 | 用途 |
|------|------|
| `assets/img/film-01.png` | 导演介绍肖像（1517×858） |
| `assets/img/film-02.png` | 短片《极光之下》海报（1912×1073） |
| `assets/img/film-03.png` | 短片《入夜之前》海报（1914×1069） |

## 本地预览

直接用浏览器打开 `index.html`，或运行：

```bash
# 任选其一
npx serve .
python -m http.server 8000 --bind 0.0.0.0
```

## 让「别的电脑」看到这个网站（已按优先级整理）

1. **GitHub Pages（推荐，永久免费 HTTPS）** —— 见下方部署步骤
2. **局域网**：`npx serve --host` 后用 `http://<本机IP>:端口` 访问（需放行防火墙端口）
3. **公网隧道**：`npx localtunnel --port 8000` 或 ngrok，临时分享

## 部署到 GitHub Pages

本机已安装并登录 `gh` CLI（账号 `dhue5`）。

```bash
gh repo create <repo-name> --public --source . --push
# 开启 Pages（托管来自分支 main 的 /root）
gh api -X POST repos/<owner>/<repo-name>/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

站点地址：`https://<owner>.github.io/<repo-name>/`

> 注意：本站为纯静态单页，所有资源用相对路径引用，所以项目页
> （`/repo-name/` 子路径）下不会 404。

## 技术要点

- **深黑背景 + 极光流光**：纯 CSS 多层超大径向/锥形渐变 + `blur(60-100px)`，
  仅动画 `transform/opacity`（合成器线程），`prefers-reduced-motion` 时冻结静态帧
- **玻璃拟态卡**：`backdrop-filter: blur() saturate()` + 1px 白 alpha 描边 +
  顶部高光渐变；呼吸光效 = 静态阴影伪元素只动画 opacity/scale（60fps）
- **tvOS 视差倾斜**：`perspective(1000px)` + `rotateX/rotateY` + `translateZ(30px)`，
  rAF + lerp 平滑回正，渐变眩光跟随光标
- **滚动叙事**：IntersectionObserver 一次性触发，卡片淡入上移、逐张级联入场
- **丝滑展开**：项目卡海报 → `<dialog>` 模态无缝放大展示详情（焦点陷阱 + 滚动锁）
- **Bento Grid**：12 列基格 + span 覆盖 + `grid-auto-flow: dense`，clamp 流式排版
