import * as vscode from "vscode";
import * as path from "path";
import { setHtml, setHtml0 } from "./contentUtil";
import { apiKeyFn, deepseekModelFn, readConfigs, readcurModelName } from "./credentials";
import { tryCall } from "./api";
import { getPageHtml } from "../page/toHTML";

const fs = require("fs");
interface ChatMessage {
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  status?: "pending" | "complete" | "error";
}

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _messages: ChatMessage[] = [];
  private _curStatus = "";
  private context: vscode.ExtensionContext;
  public static readonly viewType = "vs-deepcode-bar.webview"; // 随意命名，在最后一步要用到

  constructor(private _context: vscode.ExtensionContext) {
    this.context = _context;
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log("resolveWebviewView: ++++++++++++++++");
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
      // localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "out"))],
    };

    const webview = webviewView.webview;
    // 消息接收处理
    webview.onDidReceiveMessage(async (message) => {
      console.log("message: ", message);
      if (message.command === "userMessage_changeApiKey") {
        console.log("userMessage:userMessage_changeApiKey ");
        apiKeyFn(this.context, "changeApiKey");
      }

      if (message.command === "userMessage_changeModel") {
        console.log("userMessage:userMessage_changeModel ");
        deepseekModelFn(this.context, "change");
      }
      if (message.command === "changeConfigs") {
        readConfigs(this.context, message.data);
      }

      if (message.command === "restConfigs") {
        readConfigs(this.context, message.data);
        readcurModelName(this.context, message.data[0].modelName);
      }
      if (message.command === "htmlStart") {
        const configs = await readConfigs(this.context);
        console.log("htmlStart configs: ", configs);
        if (configs) {
          webview.postMessage({
            command: "init_configs",
            res: configs,
          });
        }
      }
      if (message.command === "readcurModelName") {
        readcurModelName(this.context, message.data);
      }
      if (message.command === "tryConfig") {
        webview.postMessage({
          command: "try_response",
          res: { start: "try axios ..." },
        });

        const res = await tryCall(message.data);
        console.log("res: ", res);

        webview.postMessage({
          command: "try_response",
          res,
          curCoifg: message.data,
        });
      }
    });

    this._updateView();
  }

  postMessage(message: any) {
    if (this._view) {
      const panel = this._view;
      console.log("postMessage: ", message);

      panel.webview.postMessage(message);
    }
  }

  private _updateView() {
    if (this._view) {
      const webview = this._view.webview;
      // const chatViewUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "chatView.js"));
      // // const stylePath = path.join(this.context.extensionPath, "src/page/style.css");
      // // let styleCss = require("fs").readFileSync(stylePath, "utf-8");

      // // const jsPath = path.join(this.context.extensionPath, "src/page/main.js");
      // // let mainJs = require("fs").readFileSync(jsPath, "utf-8");

      // const htmlPath = path.join(this.context.extensionPath, "src/page/index.html");
      // let html = fs.readFileSync(htmlPath, "utf-8");

      // // 替换 HTML 模板中的占位符
      // html = html.replace("{{cspSource}}", panel.webview.cspSource);
      // // .replace("{{styleCss}}", styleCss)
      // // .replace("{{mainJs}}", mainJs);

      //  webview.html = setHtml0(this._messages, this._curStatus);

      //  webview.html = setHtml(this._messages, this._curStatus);

      webview.html = getPageHtml();

      console.log("panel.webview.html: ", webview.html);
    }
  }

  addMessage(message: ChatMessage) {
    this._curStatus = message.status || "";
    if (message.status === "pending") {
      this._messages = [message];
    } else {
      this._messages.push(message);
    }

    this._updateView();
  }
}
