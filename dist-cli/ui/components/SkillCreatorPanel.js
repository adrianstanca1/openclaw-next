/**
 * OpenClaw Next - Skill Creator Component
 * UI for creating, analyzing, and registering new skills
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SkillCreator } from '../../skills/skill-creator.js';
let SkillCreatorPanel = class SkillCreatorPanel extends LitElement {
    static styles = css `
    :host {
      display: block;
      padding: 24px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card h2 {
      margin-top: 0;
      color: #1a1a2e;
      font-size: 18px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    input, textarea, select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #6366f1;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .hint {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #333;
      margin-left: 8px;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .analysis-result {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .metric {
      text-align: center;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .improvements {
      margin-top: 16px;
    }

    .improvements h4 {
      margin: 0 0 8px 0;
      color: #1a1a2e;
    }

    .improvements ul {
      margin: 0;
      padding-left: 20px;
    }

    .improvements li {
      margin-bottom: 4px;
      color: #059669;
    }

    .suggestions li {
      color: #d97706;
    }

    .skill-preview {
      background: #1a1a2e;
      color: #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      overflow-x: auto;
    }

    .skill-preview pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }

    .skill-preview h4 {
      margin: 0 0 12px 0;
      color: #6366f1;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab {
      padding: 8px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    .tab:hover {
      color: #6366f1;
    }

    .hidden {
      display: none;
    }

    .success-message {
      background: #d1fae5;
      color: #065f46;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .error-message {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
  `;
    request = {
        description: '',
        purpose: '',
        targetUsers: [],
        expectedInputs: [],
        expectedOutputs: [],
        constraints: [],
    };
    analysis = null;
    activeTab = 'form';
    isAnalyzing = false;
    isRegistering = false;
    message = null;
    skillCreator = new SkillCreator();
    render() {
        return html `
      <div class="container">
        <h1>Skill Creator</h1>
        <p class="subtitle">
          Describe what you need, and the AI will analyze, enhance, and create a complete skill for you.
        </p>

        <div class="grid">
          <div class="card">
            <h2>Skill Request</h2>

            <div class="form-group">
              <label for="description">What should this skill do? *</label>
              <textarea
                id="description"
                .value="${this.request.description}"
                @input="${this.updateDescription}"
                placeholder="E.g., Analyze code files to detect security vulnerabilities and suggest fixes"
              ></textarea>
              <div class="hint">Be descriptive. The AI will enhance and expand your request.</div>
            </div>

            <div class="form-group">
              <label for="purpose">Purpose (optional)</label>
              <input
                id="purpose"
                type="text"
                .value="${this.request.purpose || ''}"
                @input="${this.updatePurpose}"
                placeholder="Why do you need this skill?"
              />
            </div>

            <div class="form-group">
              <label for="targetUsers">Target Users (optional)</label>
              <input
                id="targetUsers"
                type="text"
                .value="${this.request.targetUsers?.join(', ') || ''}"
                @input="${this.updateTargetUsers}"
                placeholder="developers, security-analysts, etc."
              />
              <div class="hint">Comma-separated list of user types</div>
            </div>

            <div class="form-group">
              <label for="expectedInputs">Expected Inputs (optional)</label>
              <textarea
                id="expectedInputs"
                .value="${this.request.expectedInputs?.join('\n') || ''}"
                @input="${this.updateExpectedInputs}"
                placeholder="code file path&#10;configuration options"
              ></textarea>
              <div class="hint">One input per line</div>
            </div>

            <div class="form-group">
              <label for="constraints">Constraints (optional)</label>
              <input
                id="constraints"
                type="text"
                .value="${this.request.constraints?.join(', ') || ''}"
                @input="${this.updateConstraints}"
                placeholder="rate-limited, requires-approval"
              />
            </div>

            <button
              class="btn btn-primary"
              @click="${this.analyze}"
              ?disabled="${this.isAnalyzing || !this.request.description}"
            >
              ${this.isAnalyzing ? 'Analyzing...' : 'Analyze & Enhance'}
            </button>
          </div>

          <div class="card">
            <div class="tabs">
              <button
                class="tab ${this.activeTab === 'analysis' ? 'active' : ''}"
                @click="${() => this.activeTab = 'analysis'}"
              >Analysis</button>
              <button
                class="tab ${this.activeTab === 'preview' ? 'active' : ''}"
                @click="${() => this.activeTab = 'preview'}"
              >Skill Preview</button>
              <button
                class="tab ${this.activeTab === 'markdown' ? 'active' : ''}"
                @click="${() => this.activeTab = 'markdown'}"
              >skill.md</button>
            </div>

            ${this.analysis ? html `
              <div class="${this.activeTab === 'analysis' ? '' : 'hidden'}">
                <div class="metrics">
                  <div class="metric">
                    <div class="metric-value">${this.analysis.methods.length}</div>
                    <div class="metric-label">Methods</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${this.analysis.requires.length}</div>
                    <div class="metric-label">Dependencies</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${this.analysis.permissions.length}</div>
                    <div class="metric-label">Permissions</div>
                  </div>
                </div>

                <div class="improvements">
                  <h4>Enhancements Made</h4>
                  <ul>
                    ${this.analysis.improvements.map(i => html `<li>${i}</li>`)}
                  </ul>
                </div>

                <button
                  class="btn btn-primary"
                  @click="${this.registerSkill}"
                  ?disabled="${this.isRegistering}"
                  style="margin-top: 16px;"
                >
                  ${this.isRegistering ? 'Registering...' : 'Register Skill'}
                </button>
              </div>

              <div class="${this.activeTab === 'preview' ? '' : 'hidden'}">
                <div class="skill-preview">
                  <h4>Skill Schema</h4>
                  <pre>${JSON.stringify({
            id: this.analysis.skillId,
            name: this.analysis.skillName,
            description: this.analysis.skillDescription,
            methods: this.analysis.methods.map(m => ({
                name: m.name,
                description: m.description,
                parameters: Object.keys(m.parameters),
            })),
            requires: this.analysis.requires,
            permissions: this.analysis.permissions,
        }, null, 2)}</pre>
                </div>
              </div>

              <div class="${this.activeTab === 'markdown' ? '' : 'hidden'}">
                <div class="skill-preview">
                  <h4>skill.md</h4>
                  <pre>${this.analysis.markdownContent}</pre>
                </div>
                <button class="btn btn-secondary" @click="${this.downloadMarkdown}">
                  Download skill.md
                </button>
              </div>
            ` : html `
              <div style="text-align: center; padding: 40px; color: #888;">
                <p>Enter a skill description and click "Analyze & Enhance"</p>
                <p style="font-size: 14px;">The AI will analyze your request and generate a complete skill definition</p>
              </div>
            `}

            ${this.message ? html `
              <div class="${this.message.type}-message">
                ${this.message.text}
              </div>
            ` : null}
          </div>
        </div>
      </div>
    `;
    }
    updateDescription(e) {
        this.request = { ...this.request, description: e.target.value };
    }
    updatePurpose(e) {
        this.request = { ...this.request, purpose: e.target.value };
    }
    updateTargetUsers(e) {
        const value = e.target.value;
        this.request = {
            ...this.request,
            targetUsers: value.split(',').map(u => u.trim()).filter(Boolean)
        };
    }
    updateExpectedInputs(e) {
        const value = e.target.value;
        this.request = {
            ...this.request,
            expectedInputs: value.split('\n').map(i => i.trim()).filter(Boolean)
        };
    }
    updateConstraints(e) {
        const value = e.target.value;
        this.request = {
            ...this.request,
            constraints: value.split(',').map(c => c.trim()).filter(Boolean)
        };
    }
    async analyze() {
        if (!this.request.description)
            return;
        this.isAnalyzing = true;
        this.message = null;
        try {
            this.analysis = await this.skillCreator.analyzeRequest(this.request);
            this.activeTab = 'analysis';
        }
        catch (error) {
            this.message = {
                type: 'error',
                text: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
        finally {
            this.isAnalyzing = false;
        }
    }
    async registerSkill() {
        if (!this.analysis)
            return;
        this.isRegistering = true;
        this.message = null;
        try {
            // Dispatch event to register skill
            const event = new CustomEvent('skill-register', {
                detail: {
                    schema: this.skillCreator.generateSkillSchema(this.analysis),
                    markdown: this.analysis.markdownContent,
                },
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(event);
            this.message = {
                type: 'success',
                text: `Skill "${this.analysis.skillName}" registered successfully!`
            };
        }
        catch (error) {
            this.message = {
                type: 'error',
                text: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
        finally {
            this.isRegistering = false;
        }
    }
    downloadMarkdown() {
        if (!this.analysis)
            return;
        const blob = new Blob([this.analysis.markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.analysis.skillId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "request", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "analysis", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "activeTab", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "isAnalyzing", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "isRegistering", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], SkillCreatorPanel.prototype, "message", void 0);
SkillCreatorPanel = __decorate([
    customElement('skill-creator-panel')
], SkillCreatorPanel);
export { SkillCreatorPanel };
