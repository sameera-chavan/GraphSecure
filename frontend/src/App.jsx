
import { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [".c", ".cpp", ".h", ".hpp", ".java", ".py"];

    const validFile = allowedExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );

    if (!validFile) {
      setMessage("Please upload a C, C++, Java or Python source file.");
      event.target.value = "";
      return;
    }

    if (file.size > 100000) {
      setMessage("File is too large. Maximum allowed size is 100 KB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setCode(String(e.target?.result || ""));
      setFileName(file.name);
      setMessage(`File "${file.name}" loaded successfully.`);
      setAnalysisResult(null);
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected file.");
    };

    reader.readAsText(file);
  }

  async function prepareAnalysis() {
    if (!code.trim()) {
      setMessage("Please paste or upload source code first.");
      setAnalysisResult(null);
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setMessage("Sending source code to GraphSecure backend...");

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileName || "pasted_code.c",
          source_code: code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Backend request failed."
        );
      }

      setAnalysisResult(result);

      setMessage(
        "Source code successfully received by GraphSecure backend."
      );
    } catch (error) {
      setMessage(
        "Backend connection failed: " + error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function clearEditor() {
    setCode("");
    setFileName("");
    setMessage("");
    setAnalysisResult(null);
  }

  return (
    <div className="app-container">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">G</div>
          <div>
            <h1>GraphSecure</h1>
            <p>AI-Powered Source Code Security Research</p>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          Development Environment
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">SOURCE CODE SECURITY PLATFORM</p>
            <h2>Intelligent Vulnerability Analysis</h2>
            <p className="welcome-description">
              A Counterfactual-Explainable Multi-View
              Heterogeneous Graph Transformer research platform
              for source code vulnerability detection.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Analysis Engine</span>
            <h3>API Connected</h3>
            <p>Backend communication interface</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">Graph Views</span>
            <h3>4 Planned Views</h3>
            <p>AST · CFG · DFG · PDG</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">AI Model</span>
            <h3>Not Connected</h3>
            <p>Research model implementation pending</p>
          </div>
        </section>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ANALYSIS WORKSPACE</p>
              <h2>Submit Source Code</h2>
            </div>
            <span className="file-type-label">
              C · C++ · Java · Python
            </span>
          </div>

          <div className="upload-area">
            <label htmlFor="source-file" className="upload-button">
              Upload Source File
            </label>

            <input
              id="source-file"
              type="file"
              accept=".c,.cpp,.h,.hpp,.java,.py"
              onChange={handleFileUpload}
              hidden
            />

            <span className="file-name">
              {fileName || "No file selected"}
            </span>
          </div>

          <label className="editor-label" htmlFor="code-editor">
            Source Code Editor
          </label>

          <textarea
            id="code-editor"
            className="code-editor"
            placeholder={`// Paste your source code here

#include <stdio.h>

int main() {
    printf("Hello GraphSecure");
    return 0;
}`}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setAnalysisResult(null);
            }}
            spellCheck="false"
          />

          <div className="editor-footer">
            <span>{code.length} characters</span>
            <span>{code ? code.split("\n").length : 0} lines</span>
          </div>

          <div className="action-buttons">
            <button
              className="analyze-button"
              onClick={prepareAnalysis}
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit to Backend"}
            </button>

            <button
              className="clear-button"
              onClick={clearEditor}
              disabled={loading}
            >
              Clear Editor
            </button>
          </div>

          {message && (
            <div className="message-panel" role="status">
              {loading && <span className="loading-spinner"></span>}
              {message}
            </div>
          )}

          {analysisResult && (
            <section className="result-panel">
              <p className="eyebrow">BACKEND RESPONSE</p>
              <h3>Source Code Received Successfully</h3>

              <div className="result-grid">
                <div>
                  <span>Filename</span>
                  <strong>{analysisResult.filename}</strong>
                </div>

                <div>
                  <span>Characters</span>
                  <strong>{analysisResult.characters}</strong>
                </div>

                <div>
                  <span>Lines</span>
                  <strong>{analysisResult.lines}</strong>
                </div>

                <div>
                  <span>Input Status</span>
                  <strong>
                    {analysisResult.input_received
                      ? "Received"
                      : "Not received"}
                  </strong>
                </div>

                <div>
                  <span>Model Status</span>
                  <strong>{analysisResult.model_status}</strong>
                </div>
              </div>

              <p className="result-note">
                {analysisResult.message}
              </p>

              <p className="disclaimer">
                This confirms backend data reception only.
                No actual vulnerability prediction has been
                performed yet.
              </p>
            </section>
          )}
        </section>

        <section className="pipeline-section">
          <p className="eyebrow">RESEARCH ARCHITECTURE</p>
          <h2>Planned Research Pipeline</h2>

          <div className="pipeline-grid">
            {[
              ["01", "Source Code Input", "Input interface"],
              ["02", "Code Property Graph", "Joern integration"],
              ["03", "Multi-View Graphs", "AST, CFG, DFG, PDG"],
              ["04", "Code Embeddings", "GraphCodeBERT"],
              ["05", "HGT Architecture", "Heterogeneous graph learning"],
              ["06", "Cross-View Fusion", "Attention mechanism"],
              ["07", "Counterfactual Analysis", "Explainability"],
              ["08", "Candidate Patch", "LLM-assisted generation"],
            ].map(([number, title, description]) => (
              <div className="pipeline-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>
            GraphSecure | M.Tech Research Project
          </p>
          <p>
            Counterfactual-Explainable Multi-View
            Heterogeneous Graph Transformer
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
