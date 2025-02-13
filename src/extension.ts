import * as vscode from "vscode";
import { callDeepSeekAPI } from "./view/api";
import { SidebarProvider } from "./view/sidebarView";

const mainFn = async (panel: SidebarProvider, context: vscode.ExtensionContext, fnType: string) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }
  const selection = editor.selection;
  const selectedCode = editor.document.getText(selection);
  if (!selectedCode) {
    vscode.window.showErrorMessage("No code selected");
    return;
  }

  panel.postMessage({
    command: "startCode",
    sourceData: selectedCode,
  });

  let title = "selected";
  let text = selectedCode;

  if (fnType === "optimizeCode") {
    title = "优化并注释";
    text = `对以下代码内容，${title}:\n\`\`\`\n${text}\n\`\`\``;
  }

  if (fnType === "comment") {
    title = "只进行注释不要优化";
    text = `对以下代码内容，${title}:\n\`\`\`\n${text}\n\`\`\``;
  }

  if (fnType === "translate") {
    title = "翻译为英语";
    text = `对以下内容，${title}:\n\`\`\`\n${text}\n\`\`\``;
  }

  const res = await callDeepSeekAPI(title, text, context);

  console.log("res:++++++ ", res);

  panel.postMessage({
    command: "right_response",
    res,
  });
};

export function activate(context: vscode.ExtensionContext) {
  try {
    const panel = new SidebarProvider(context);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, panel, {
        webviewOptions: { retainContextWhenHidden: true },
      }),
    );

    // selected功能
    let selected = vscode.commands.registerCommand("deepcode.selected", async () => {
      await mainFn(panel, context, "selected");
    });
    context.subscriptions.push(selected);

    // 翻译功能
    let translate = vscode.commands.registerCommand("deepcode.translate", async () => {
      await mainFn(panel, context, "translate");
    });
    context.subscriptions.push(translate);

    // 优化并注释功能
    let optimizeCode = vscode.commands.registerCommand("deepcode.optimizeCode", async () => {
      await mainFn(panel, context, "optimizeCode");
    });
    context.subscriptions.push(optimizeCode);

    // 注释功能
    let comment = vscode.commands.registerCommand("deepcode.comment", async () => {
      await mainFn(panel, context, "comment");
    });
    context.subscriptions.push(comment);
  } catch (e) {
    vscode.window.showErrorMessage("No code  " + e);
  }
}

export function deactivate() {}
