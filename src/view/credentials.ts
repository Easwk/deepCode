import * as vscode from "vscode";

export const apiKeyFn = async (context: vscode.ExtensionContext, type = "") => {
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

export const deepseekModelFn = async (context: vscode.ExtensionContext, type = "") => {
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
  if (type === "get") {
    let newKey = await context.secrets.get("deepseekModel");
    return newKey || "";
  }
};

export const readConfigs = async (context: vscode.ExtensionContext, data: any = null) => {
  if (data) {
    await context.secrets.store("deepCodeModels", JSON.stringify(data));
    vscode.window.showInformationMessage("更新deepCode配置成功!");
  } else {
    let res = await context.secrets.get("deepCodeModels");

    return res ? JSON.parse(res) : null;
  }
};

export const readcurModelName = async (context: vscode.ExtensionContext, data: any = null) => {
  if (data) {
    await context.secrets.store("curModelName", data);
  } else {
    return await context.secrets.get("curModelName");
  }
};

export const getCurCurConfig = async (context: vscode.ExtensionContext) => {
  try {
    const name = await readcurModelName(context);
    const configs = await readConfigs(context);
    if (name && configs) {
      const config = configs.find((item: any) => item.modelName === name);
      if (config) {
        return config;
      }
    }
    if (!name && configs) {
      return configs[0];
    }
  } catch (e) {
    vscode.window.showErrorMessage("模型配置获取失败:" + e);
    return false;
  }
};
