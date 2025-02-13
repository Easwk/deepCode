import axios from "axios";
import * as vscode from "vscode";
import { apiKeyFn, deepseekModelFn, getCurCurConfig } from "./credentials";

// 异步函数，调用DeepSeek API
export async function callDeepSeekAPI(title: string, text: string, context: any): Promise<any> {
  // 尝试获取当前配置信息
  try {
    const modelConfig = await getCurCurConfig(context);
    // 使用vscode窗口进度条显示操作提示
    const response: any = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deepcode: ${title} with ${modelConfig.modelName}...`,
        cancellable: false,
      },
      async () => {
        // 判断modelConfig是否有效
        if (modelConfig) {
          // 获取model配置信息
          const {
            ajaxPostReqConfig: { url, data, config },
            modelName,
            ajaxReqParamPath,
          }: any = modelConfig;

          // 通过path路径设置数据值
          setValueByPath(data, ajaxReqParamPath, text);
          console.log("url, data, config: ", url, data, config);

          // 发送post请求并返回响应
          return axios.post(url, data, config);
        }
        return false;
      },
    );

    console.log("response: ++++", response);

    // 根据响应状态码返回对应结果
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
    // 捕获并处理异常
    return {
      code: 100,
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

// 异步函数，尝试调用model指定的API
export async function tryCall(modelConfig: any): Promise<any> {
  // 尝试获取配置信息
  try {
    // 获取model配置信息
    const {
      ajaxPostReqConfig: { url, data, config },
      modelName,
      ajaxReqParamPath,
    }: any = modelConfig;

    // 通过path路径设置数据值
    setValueByPath(data, ajaxReqParamPath, `你是谁啊啊啊？？？`);
    console.log("url, data, config: ", url, data, config);

    // 使用vscode窗口进度条显示操作提示并发送post请求
    const response: any = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deepcode:Try to linking ${modelName} ...`,
        cancellable: false,
      },
      async () => {
        // 返回post请求的响应
        return await axios.post(url, data, config);
      },
    );
    console.log("response: ++++", response);

    // 根据响应状态码返回对应结果
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
    // 捕获并打印异常
    console.log("tryCall error: ", error);
    // 返回异常信息
    return {
      code: 100,
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

// 路径解析函数，将数组索引转换为点语法
function parsePath(path: any) {
  return path
    .replace(/\[(\d+)\]/g, ".$1") // 将数组索引转为点语法
    .split(".") // 按点分割
    .filter((p: any) => p !== "") // 移除空字符串
    .map((p: any) => (isNaN(p) ? p : parseInt(p, 10))); // 转换数字索引
}

// 通过路径设置对象值的函数
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
