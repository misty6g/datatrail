let pyodide = null;

self.onmessage = async (event) => {
  const message = event.data;
  try {
    if (message.type === "init") {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");
      pyodide = await self.loadPyodide();
      self.postMessage({ type: "ready" });
      return;
    }
    if (!pyodide) throw new Error("Python is still loading.");
    let stdout = "";
    pyodide.setStdout({
      batched: (text) => {
        stdout += `${text}\n`;
      },
    });
    pyodide.setStderr({
      batched: (text) => {
        stdout += `${text}\n`;
      },
    });
    await pyodide.runPythonAsync(message.setup ?? "");
    await pyodide.runPythonAsync(message.code ?? "");
    await pyodide.runPythonAsync(message.validation ?? "");
    self.postMessage({ type: "result", ok: true, stdout });
  } catch (error) {
    self.postMessage({
      type: "result",
      ok: false,
      stdout: "",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
