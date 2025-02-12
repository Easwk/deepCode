import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.showVueWebview", () => {
      const panel = vscode.window.createWebviewPanel("vueWebview", "Vue3 Webview", vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out"))],
      });

      // 构建 Vue 资源路径
      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, "out/webview/assets/index.js")),
      );

      // 替换 HTML 模板中的占位符
      const htmlPath = path.join(context.extensionPath, "webview/index.html");
      let html = require("fs").readFileSync(htmlPath, "utf-8");
      html = html.replace("{{cspSource}}", panel.webview.cspSource).replace("{{scriptUri}}", scriptUri.toString());

      panel.webview.html = html;

      // 处理来自 Webview 的消息
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (message.command === "alert") {
            vscode.window.showInformationMessage(message.text);
            panel.webview.postMessage({
              command: "response",
              text: "Message received by extension!",
            });
          }
        },
        undefined,
        context.subscriptions,
      );
    }),
  );
}
