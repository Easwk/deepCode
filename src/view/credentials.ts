import * as vscode from "vscode";

// 函数：处理API密钥的改变和获取
export const apiKeyFn = async (context: vscode.ExtensionContext, type = "") => {
  // 检查是否需要改变API密钥
  if (type === "changeApiKey") {
    let newApiKey = await vscode.window.showInputBox({
      prompt: "请输入DeepSeek API密钥",
      ignoreFocusOut: true,
    });
    if (newApiKey) {
      await context.secrets.store("deepseekApiKey", newApiKey);
      vscode.window.showInformationMessage("已保存DeepSeek API密钥");
    }
  }
  // 检查是否需要获取API密钥
  if (type === "getApiKey") {
    let apiKey = await context.secrets.get("deepseekApiKey");
    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: "请输入DeepSeek API密钥",
        ignoreFocusOut: true,
      });
      if (apiKey) {
        await context.secrets.store("deepseekApiKey", apiKey);
        vscode.window.showInformationMessage("已保存DeepSeek API密钥");
      }
    }
    return apiKey || "";
  }
};

// 函数：处理模型配置的改变和获取
export const deepseekModelFn = async (context: vscode.ExtensionContext, type = "") => {
  // 检查是否需要改变模型配置
  if (type === "change") {
    let newKey = await vscode.window.showInputBox({
      prompt: "请输入DeepSeek Model",
      ignoreFocusOut: true,
    });
    if (newKey) {
      await context.secrets.store("deepseekModel", newKey);
      vscode.window.showInformationMessage("当前deepseekModel: " + newKey);
    }
  }
  // 检查是否需要获取模型配置
  if (type === "get") {
    let newKey = await context.secrets.get("deepseekModel");
    return newKey || "";
  }
};

// 函数：读取配置数据
export const readConfigs = async (context: vscode.ExtensionContext, data: any = null) => {
  // 如果提供了新的配置数据则存储
  if (data) {
    await context.secrets.store("deepCodeModels", JSON.stringify(data));
    vscode.window.showInformationMessage("更新deepCode配置成功!");
  } else {
    // 否则读取配置数据
    let res = await context.secrets.get("deepCodeModels");
    return res ? JSON.parse(res) : null;
  }
};

// 函数：读取当前模型名称
export const readcurModelName = async (context: vscode.ExtensionContext, data: any = null) => {
  // 如果提供了新的名称则存储
  if (data) {
    await context.secrets.store("curModelName", data);
  } else {
    // 否则读取当前模型名称
    return await context.secrets.get("curModelName");
  }
};

// 函数：获取当前配置
export const getCurCurConfig = async (context: vscode.ExtensionContext) => {
  try {
    // 读取当前模型名称
    const name = await readcurModelName(context);
    // 读取模型配置
    const configs = await readConfigs(context);
    // 检查名称和配置是否存在
    if (name && configs) {
      const config = configs.find((item: any) => item.modelName === name);
      if (config) {
        return config;
      }
    }
    // 如果名称不存在但配置存在，则返回第一个配置
    if (!name && configs) {
      return configs[0];
    }
  } catch (e) {
    // 显示错误消息
    vscode.window.showErrorMessage("模型配置获取失败:" + e);
    return false;
  }
};
