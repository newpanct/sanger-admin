/**
 * 压缩 HTML（适用于邮件模板）
 * - 去掉换行
 * - 合并多余空格
 * - 保留标签结构
 */
export function compressEmailHtml(html = "") {
    return html
      .replace(/\n+/g, "")          // 去换行
      .replace(/\s{2,}/g, " ")      // 多个空格 → 一个
      .replace(/>\s+</g, "><")      // 标签之间空白
      .trim();
  }
  