import axios from "axios";
import * as vscode from "vscode";
import { apiKeyFn, deepseekModelFn, getCurCurConfig } from "./credentials";

export async function callDeepSeekAPI(title: string, text: string, context: any): Promise<any> {
  try {
    const modelConfig = await getCurCurConfig(context);
    const response: any = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deepcode: ${title} with ${modelConfig.modelName}...`,
        cancellable: false,
      },
      async () => {
        if (modelConfig) {
          const {
            ajaxPostReqConfig: { url, data, config },
            modelName,
            ajaxReqParamPath,
          }: any = modelConfig;

          setValueByPath(data, ajaxReqParamPath, text);
          console.log("url, data, config: ", url, data, config);

          return axios.post(url, data, config);
        }
        return false;
      },
    );

    console.log("response: ++++", response);

    if (response.status === 200) {
      return {
        code: 200,
        response: response.data,
        modelName: modelConfig.modelName,
      };
    } else {
      return {
        code: response.status,
        error: response.statusText,
      };
    }
  } catch (error) {
    return {
      code: 100,
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export async function tryCall(modelConfig: any): Promise<any> {
  try {
    const {
      ajaxPostReqConfig: { url, data, config },
      modelName,
      ajaxReqParamPath,
    }: any = modelConfig;

    setValueByPath(data, ajaxReqParamPath, `你是谁啊啊啊？？？`);
    console.log("url, data, config: ", url, data, config);

    const response: any = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deepcode:Try to linking ${modelName} ...`,
        cancellable: false,
      },
      async () => {
        return await axios.post(url, data, config);
      },
    );
    console.log("response: ++++", response);

    if (response.status === 200) {
      return {
        code: 200,
        response: response.data,
      };
    } else {
      return {
        code: response.status,
        error: response.statusText,
      };
    }
  } catch (error) {
    console.log("tryCall error: ", error);
    return {
      code: 100,
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

function parsePath(path: any) {
  return path
    .replace(/\[(\d+)\]/g, ".$1") // 将数组索引转为点语法
    .split(".") // 按点分割
    .filter((p: any) => p !== "") // 移除空字符串
    .map((p: any) => (isNaN(p) ? p : parseInt(p, 10))); // 转换数字索引
}

function setValueByPath(obj: any, path: any, value: any) {
  const keys = parsePath(path);
  console.log("keys: ", keys);
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current = current[key];
  }
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

// 使用示例
const path = "data.messages[11].content";
//setValueByPath(obj, path, "我是ccc");
