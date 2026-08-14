export function applyThemeVars(token = {}) {
  const root = document.documentElement;
  if (token.colorPrimary) root.style.setProperty("--app-primary", token.colorPrimary);
  if (token.colorSuccess) root.style.setProperty("--app-success", token.colorSuccess);
  if (token.colorWarning) root.style.setProperty("--app-warning", token.colorWarning);
  if (token.colorError) root.style.setProperty("--app-error", token.colorError);
  if (token.colorInfo) root.style.setProperty("--app-info", token.colorInfo);
}
