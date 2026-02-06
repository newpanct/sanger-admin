import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/* ================== 配置 ================== */

const ROOT = process.cwd();

const BUILD = path.resolve(ROOT, "build");

const TARGET = "Z:/users/panchengtian/online-project/admin2.sangerbox.com";

const LIVE = path.join(TARGET, "live");

/* ========================================== */


/* 时间格式 */
function getTime() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}


/* 安全执行命令（支持 robocopy 特殊返回码） */
function run(cmd, { allowRobocopy = false } = {}) {
  try {
    execSync(cmd, {
      stdio: "inherit",
      windowsHide: true,
    });
  } catch (err) {
    const code = err.status ?? -1;

    // robocopy 特殊处理
    if (allowRobocopy && code >= 0 && code <= 7) {
      console.log(`⚠️ robocopy 正常完成 (code=${code})`);
      return;
    }

    console.error("❌ 命令执行失败:", cmd);
    console.error("退出码:", code);

    process.exit(1);
  }
}


/* ================== 主流程 ================== */

console.log("🚀 开始构建...");
run("npm run build");


/* 校验 build */
if (!fs.existsSync(BUILD)) {
  console.error("❌ build 目录不存在，构建失败");
  process.exit(1);
}


/* 校验目标盘 */
if (!fs.existsSync("Z:/")) {
  console.error("❌ Z 盘未挂载，部署终止");
  process.exit(1);
}


/* 创建目标目录 */
if (!fs.existsSync(TARGET)) {
  console.log("📁 创建目标目录...");
  fs.mkdirSync(TARGET, { recursive: true });
}


/* 备份旧版本 */
if (fs.existsSync(LIVE)) {
  const backupName = `backup-${getTime()}`;
  const backupPath = path.join(TARGET, backupName);

  console.log("📦 备份旧版本 →", backupName);

  fs.renameSync(LIVE, backupPath);
}


/* 创建新 live */
fs.mkdirSync(LIVE, { recursive: true });


/* 发布 */
console.log("📂 同步新版本...");

run(
  `robocopy "${BUILD}" "${LIVE}" /MIR /R:2 /W:2 /NFL /NDL`,
  { allowRobocopy: true }
);


console.log("🎉 部署完成！");
