import fs from "fs";
import path from "path";

const TARGET = "Z:/users/panchengtian/online-project/admin2.sangerbox.com";
const LIVE = path.join(TARGET, "live");

// 找出所有备份
const backups = fs
  .readdirSync(TARGET)
  .filter((n) => n.startsWith("backup-"))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.log("❌ 没有可回滚版本");
  process.exit(0);
}

const latest = backups[0];
const backupPath = path.join(TARGET, latest);

// 删除当前 live
if (fs.existsSync(LIVE)) {
  fs.rmSync(LIVE, { recursive: true, force: true });
}

// 恢复备份
fs.renameSync(backupPath, LIVE);

console.log("⏪ 已回滚到版本:", latest);
