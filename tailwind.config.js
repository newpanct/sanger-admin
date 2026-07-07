module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  // 关闭 preflight，避免与 Antd 5 的默认样式冲突
  // （Tailwind base 会重置 button/h1~h6/ul/margin 等，破坏 antd 组件外观）
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
