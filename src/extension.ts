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

  const preTitle = fnType === "optimizeCode" ? "优化并注释," : "只进行注释不要优化,";

  const res = await callDeepSeekAPI(selectedCode, preTitle, context);

  console.log("res:++++++ ", res);

  panel.postMessage({
    command: "right_response",
    res,
  });
};

export function activate(context: vscode.ExtensionContext) {
  try {
    const panel = new SidebarProvider(context);

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, panel));
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
