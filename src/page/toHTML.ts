export function getPageHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Expires" content="0" />

  <meta charset="UTF-8" />
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover" />

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/github.min.css" />

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/highlight.min.js"></script>

  <script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>

  <script src=" https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <!-- 全局样式 -->
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css" />
  <!-- UI -->
  <script src="https://unpkg.com/element-plus"></script>
</head>

<body>
  <div id="load">deepCode loading</div>
  <div id="app">
    <el-tabs type="border-card" tab-position="bottom" class="tabs">
      <el-tab-pane label="User">
        <p>鼠标右键选中代码，开88888始进行对话</p>
        <div v-for="item in state.messageList" :key="item.date">
          <p>{{item.type}}:</p>
          <pre><code>{{item.context}}  </code></pre>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Config">
        <el-select v-model="state.curModelName" placeholder="模型" size="small" style="width: 240px"
          @change="selectChange">
          <el-option v-for="item in state.modelConfigs" :key="item.modelName" :label="item.modelName"
            :value="item.modelName"></el-option>
        </el-select>
        <el-button @click="resetClick" size="small">reset</el-button>

        <el-input v-model="state.curModel" :autosize="{ minRows: 8 , maxRows:14 }" type="textarea"
          placeholder="模型配置"></el-input>
        <br />
        <el-button @click="tryClick" size="small">try</el-button>
        <el-button @click="saveClick" size="small">save</el-button>
        <br />
        <div class="error">{{state.error}}</div>
        <br />
        <div class="tips">{{state.tips}}</div>
        <div class="tips">{{state.msgTest}}</div>
        <br />
        <div class="tips" v-if="state.response">
          <p>模型响应对象结构</p>
          response: {{state.response}}
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</body>

<script>
  hljs.highlightAll();
</script>

<script></script>
<script>
  const { createApp, watch, computed, reactive, onMounted } = Vue;

  const APP = createApp({
    setup() {
      //  发送消息到插件核心
      const vscode = acquireVsCodeApi();

      const sendMessage = (msg) => {
        try {
          vscode.postMessage(msg);
        } catch (e) {
          state.error = e;
          state.tips = vscode;
        }
      };

      // 添加HTML转义函数（防止XSS攻击并保留代码格式）
      const escapeHtml = (unsafe) => {
        const code = unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        return code;
      };

      const defConfigs = [
        {
          modelName: "deepseek-chat",
          ajaxPostReqConfig: {
            url: "https://api.deepseek.com/chat/completions",
            data: {
              model: "deepseek-chat", // 默认deepseek-chat
              messages: [
                {
                  role: "user",
                  content: "你是谁啊",
                },
              ],
              stream: false,
              response_format: {
                type: "text",
              },
            },
            config: {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer sk-c49544eefa7343ae83fbe4f500f44659",
              },
            },
          },
          ajaxReqParamPath: "messages[0].content",
          ajaxPostResponePath: "response.choices[0].message.content",
        },
        {
          modelName: "Qwen/Qwen2.5-7B-Instruct(Free)",
          ajaxPostReqConfig: {
            url: "https://api.siliconflow.cn/v1/chat/completions",
            data: {
              model: "Qwen/Qwen2.5-7B-Instruct",
              messages: [
                {
                  role: "user",
                  content: "中国大模型行业2025年将会迎来哪些机遇和挑战？",
                },
              ],

              response_format: { type: "text" },
            },
            config: {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer sk-wzlatwbqgjohinanrmqsecobexskyxaqacnkbeqbcduitmcp",
              },
            },
          },
          ajaxReqParamPath: "messages[0].content",
          ajaxPostResponePath: "response.choices[0].message.content",
        },
      ];

      const state = reactive({
        tips: "",
        error: "",
        msgTest: "",
        curModelName: "",
        curModel: null,
        modelConfigs: [
          {
            modelName: "modelName",
          },

          ...defConfigs,
        ],

        messageList: [],
      });

      const clearMsg = () => {
        state.response = "";
        state.tips = "";
        state.error = "";
      };
      const checkConfig = (config) => {
        clearMsg();
        if (!config.modelName) {
          state.error = "需要设置模型名称参数----modelName";
          return false;
        }
        if (!config.ajaxPostReqConfig) {
          state.error = "需要设置post请求参数----ajaxPostReqConfig";
          return false;
        }
        if (!config.ajaxPostResponePath) {
          state.error = "需要设置响应解析路径参数----ajaxPostResponePath";
          return false;
        }
        return true;
      };

      const tryClick = () => {
        clearMsg();
        try {
          const config = JSON.parse(state.curModel);
          if (checkConfig(config) && state.curModel) {
            sendMessage({ command: "tryConfig", data: _.cloneDeep(config) });
          }
        } catch (e) {
          state.error = e;
        }
      };
      const saveClick = () => {
        clearMsg();
        try {
          const config = JSON.parse(state.curModel);
          if (checkConfig(config) && state.curModel) {
            let sameModeName = _.remove(state.modelConfigs, { modelName: config.modelName });
            if (sameModeName.length) {
              state.tips = "修改成功";
            } else {
              state.tips = "新增成功";
            }
            state.modelConfigs.push(config);
            state.curModelName = config.modelName;
            sendMessage({ command: "changeConfigs", data: _.cloneDeep(state.modelConfigs) });
          }
        } catch (e) {
          state.error = e;
        }
      };

      const selectChange = (curModelName) => {
        clearMsg();
        state.curModel = JSON.stringify(_.find(state.modelConfigs, { modelName: curModelName }), null, 2);
        if (!state.curModel) {
          state.curModel = null;
        } else {
          sendMessage({ command: "readcurModelName", data: curModelName });
        }
      };

      const resetClick = (curModelName) => {
        state.modelConfigs = defConfigs;

        state.tips = "重置成功";
        sendMessage({ command: "restConfigs", data: _.cloneDeep(state.modelConfigs) });
      };

      // 接收来自插件核心的消息
      window.addEventListener("message", (event) => {
        const { command, res, curCoifg, sourceData } = event.data;
        clearMsg();

        if (command === "try_response") {
          if (res.code === 200) {
            try {
              state.tips = _.get(res, curCoifg.ajaxPostResponePath);
            } catch (e) {
              state.error = "解析响应数据失败,根据数据结构设置正确的响应解析路径参数(ajaxPostResponePath):" + e;
            }
            state.response = res.response;
          }
          if (res.code === 100) {
            state.error = res.error;
          }
        }
        if (command === "right_response") {
          if (res.code === 200) {
            try {
              const { modelName } = res;
              const config = _.find(state.modelConfigs, { modelName });
              const context = _.get(res, config.ajaxPostResponePath);

              state.messageList.push({
                context: context,
                type: "sys",
                date: new Date(),
              });
            } catch (e) {
              const context = "解析响应数据失败,根据数据结构设置正确的响应解析路径参数(ajaxPostResponePath):" + e;
              state.messageList.push({
                context,
                type: "sys",
                date: new Date(),
              });
            }
          }
          if (res.code === 100) {
            const context = res.error;
            state.messageList.push({
              context,
              type: "sys",
              date: new Date(),
            });
          }
          setTimeout(() => {
            hljs.highlightAll();
          });
        }

        if (command === "startCode") {
          state.messageList.push({
            context: sourceData,
            type: "user",
            date: new Date(),
          });
          setTimeout(() => {
            hljs.highlightAll();
          });
        }

        if (command === "init_configs") {
          state.modelConfigs = res;
          state.curModel = JSON.stringify(state.modelConfigs[0], null, 2);
          state.curModelName = state.modelConfigs[0].modelName;
        }
      });

      onMounted(() => {
        sendMessage({ command: "htmlStart" });
        document.getElementById("load").innerHTML = "";
      });

      return {
        state,

        tryClick,
        saveClick,
        selectChange,
        resetClick,
        escapeHtml,
      };
    },
  });

  APP.use(ElementPlus).mount("#app");
</script>

</html>

<style>
  :root {
    --vh: 1vh;
  }

  #load {
    color: red;
  }

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
    background-color: #cfc6c610;
    padding: 0;
    margin: 0;
  }

  .tabs {
    height: calc(100% - 25px);
    background-color: #eee;
    padding: 10px;

    overflow: hidden;
  }

  .error {
    color: red;
  }

  .tips {
    color: rgb(36, 170, 3);
  }

  .el-tab-pane {
    overflow: auto;
    height: 100%;
  }
</style>`;

  return html;
}
