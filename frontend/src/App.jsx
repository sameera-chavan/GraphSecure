
import { useState } from "react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showCounterfactualDemo, setShowCounterfactualDemo] = useState(false);

  const API_URL =
    (import.meta.env.VITE_API_URL || (
      import.meta.env.PROD
        ? "https://graphsecure-api.onrender.com"
        : "http://127.0.0.1:8000"
    )).replace(/\/+$/, "");

  function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [
      ".c", ".cpp", ".h", ".hpp", ".java", ".py"
    ];

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
    setMessage("Analyzing source code using GraphSecure ML model...");

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
        "GraphSecure experimental ML analysis completed successfully."
      );
    } catch (error) {
      setMessage("Analysis failed: " + error.message);
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

  const modelConnected =
    analysisResult?.model_status === "connected";

  const prediction =
    analysisResult?.prediction;

  const score =
    typeof analysisResult?.model_score === "number"
      ? (analysisResult.model_score * 100).toFixed(2)
      : null;

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
            <p>FastAPI backend</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">Graph Views</span>
            <h3>4 Planned Views</h3>
            <p>AST · CFG · DFG · PDG</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">AI Model</span>
            <h3>
              {modelConnected
                ? "Baseline Connected"
                : "Awaiting Analysis"}
            </h3>
            <p>
              {modelConnected
                ? "TF-IDF + Logistic Regression"
                : "Experimental ML classifier"}
            </p>
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
              {loading ? "Analyzing..." : "Analyze Source Code"}
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
              <p className="eyebrow">GRAPHSECURE ML RESULTS</p>

              <h3>Vulnerability Analysis Report</h3>

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

                <div>
                  <span>Analysis Status</span>
                  <strong>{analysisResult.analysis_status}</strong>
                </div>
              </div>

              {prediction && (
                <div className="prediction-card">
                  <p className="eyebrow">MODEL PREDICTION</p>

                  <h2
                    style={{
                      color:
                        prediction === "Vulnerable"
                          ? "#ef4444"
                          : "#16a34a",
                    }}
                  >
                    {prediction}
                  </h2>

                  <div className="prediction-details">
                    <div>
                      <span>Prediction Label</span>
                      <strong>
                        {analysisResult.prediction_label}
                      </strong>
                    </div>

                    <div>
                      <span>Model Score</span>
                      <strong>
                        {score !== null ? `${score}%` : "Unavailable"}
                      </strong>
                    </div>

                    <div>
                      <span>Model</span>
                      <strong>
                        {analysisResult.model_name}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <p className="result-note">
                {analysisResult.message}
              </p>

              <p className="disclaimer">
                Research prototype: This is an experimental
                TF-IDF + Logistic Regression baseline trained
                on the Devign dataset. Its predictions are not
                confirmed security verdicts. The model does not
                yet implement the proposed HGT architecture,
                graph-based analysis, or counterfactual explanations.
                Do not use this result alone to make security decisions.
              </p>
            </section>
          )}
        </section>

        <section className="counterfactual-section">
          <div className="counterfactual-heading">
            <div>
              <p className="eyebrow">EXPLAINABILITY PILOT</p>
              <h2>Recorded Counterfactual Example</h2>
              <p className="counterfactual-intro">
                An offline experiment from the 80-function research pilot.
                This example is separate from the live source-code analysis above.
              </p>
            </div>
            <span className="counterfactual-status">Joern parse succeeded</span>
          </div>

          <div className="counterfactual-summary">
            <div>
              <span>Sample</span>
              <strong>qemu_label0_9045</strong>
            </div>
            <div>
              <span>Dataset ground truth</span>
              <strong>Safe (0)</strong>
            </div>
            <div>
              <span>Before edit</span>
              <strong className="cf-vulnerable">Vulnerable (1)</strong>
            </div>
            <div>
              <span>After edit</span>
              <strong className="cf-safe">Safe (0)</strong>
            </div>
          </div>

          <div className="counterfactual-edit">
            <span>Single statement removed in the pilot experiment</span>
            <pre><code>- a20_mask = 0xffffffff;</code></pre>
          </div>

          <button
            type="button"
            className="counterfactual-toggle"
            onClick={() => setShowCounterfactualDemo((visible) => !visible)}
            aria-expanded={showCounterfactualDemo}
          >
            {showCounterfactualDemo ? "Hide pilot details" : "Show pilot details"}
          </button>

          {showCounterfactualDemo && (
            <div className="counterfactual-details">
              <p>
                The pilot TF-IDF classifier changed its prediction from
                Vulnerable to Safe after this statement was removed. The
                dataset label for this sample is Safe, so the original
                prediction was a false positive.
              </p>
              <p>
                Joern successfully parsed the modified source. This confirms
                parser acceptance only; it does not establish semantic
                equivalence, behavioral correctness, or security.
              </p>
              <p className="counterfactual-warning">
                This is a saved, sample-specific research demonstration—not
                a live counterfactual generated for the code currently in
                the editor. The live Analyze endpoint continues to use the
                baseline classifier.
              </p>
            </div>
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
          <p>GraphSecure | M.Tech Research Project</p>
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
