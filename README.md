# 我们的时间博物馆

这是一个 React + Vite + Tailwind 的共享版小应用。

## 本地运行

```bash
npm install
npm run dev
```

电脑打开：

```text
http://127.0.0.1:5173
```

手机和电脑在同一个 Wi-Fi 时，可以用电脑的局域网 IP 访问：

```text
http://电脑IP:5173
```

## 两个人共享数据

现在内容会保存到项目自带的小后端里：

```text
server/data/museum.json
```

两个人打开同一个网址，就会看到同一份内容。一个人编辑后，另一个人稍等几秒刷新或等待自动同步即可看到变化。

## 生产运行

```bash
npm run build
npm start
```

生产访问地址通常是：

```text
http://服务器地址:4178
```

如果要让不在同一个 Wi-Fi 的人也能用，需要把这个项目部署到一台公网服务器或云平台。
