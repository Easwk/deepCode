// 添加HTML转义函数（防止XSS攻击并保留代码格式）
export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function textFn(messages: any[], curStatus: string) {
  let text = "";
  messages.forEach((msg) => {
    const codeContent = `<pre><code> ${escapeHtml(msg.content)} </code></pre>`;
    text += `
          <div class="message ${msg.type}">
              <div class="message-header">
                  <strong>${msg.type}: ${msg.type === "user" ? ":优化以下代码并添加注释" : ":结果如下"}  </strong>
                  <span class="timestamp"> (${msg.timestamp.toLocaleTimeString()}) </span>
              </div>
              <div class="message-content">
                  ${codeContent}
              </div>
              
          </div>
      `;
  });
  const statusBadge =
    curStatus === "pending"
      ? '<span class="status loading">⏳ Processing...</span>'
      : curStatus === "error"
      ? '<span class="status error">❌ Failed</span>'
      : "";

  text += statusBadge;
  return text;
}

export function setHtml(messages: any[], curStatus: string) {
  console.log(" this._messages: ", messages);

  const html = `<!DOCTYPE html>
                  <html lang="en">
                    <head>
                      <meta charset="UTF-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                      <title>Hello World!</title>
                      <style>
                      .message-content{background:#f2f2f2}
                      button { padding: 5px 10px; margin: 5px; }
                      </style>
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/github.min.css">
                      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/highlight.min.js"></script>
                    <body>
                      <button id="helloBtn">注册/修改key</button><button id="modelBtn">修改model</button>
                      <div class="chat-container"  >${textFn(messages, curStatus)}</div>
                      <script>
                        hljs.highlightAll();
                      </script>
                      <script>
                        const vscode = acquireVsCodeApi();
                        console.log('vscode: ', vscode);

                      document.getElementById('helloBtn').addEventListener('click', () => {
                        vscode.postMessage({ command: 'userMessage_changeApiKey' });
                      });

                      document.getElementById('modelBtn').addEventListener('click', () => {
                        vscode.postMessage({ command: 'userMessage_changeModel' });
                      });
                    </script>
                    </body>
                  </html>`;

  return html;
}
