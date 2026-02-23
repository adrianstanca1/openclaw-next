/**
 * OpenClaw Next - Skill Creator Skill
 * Superintelligence Agentic Gateway System
 *
 * Analyzes user skill requests, enhances them, and generates
 * complete skill definitions with skill.md documentation.
 */

import type { SkillSchema, SkillMethod, SkillParameter } from '../agents/types.js';
import { generateId } from '../core/utils.js';

export interface SkillAnalysisResult {
  originalRequest: string;
  enhancedRequest: string;
  improvements: string[];
  skillId: string;
  skillName: string;
  skillDescription: string;
  methods: SkillMethod[];
  requires: string[];
  permissions: string[];
  markdownContent: string;
}

export interface SkillRequest {
  description: string;
  purpose?: string;
  targetUsers?: string[];
  expectedInputs?: string[];
  expectedOutputs?: string[];
  constraints?: string[];
}

/**
 * Skill Creator - Analyzes and enhances skill requests
 */
export class SkillCreator {
  /**
   * Analyze a skill request and enhance it
   */
  async analyzeRequest(request: SkillRequest): Promise<SkillAnalysisResult> {
    const skillId = this.generateSkillId(request.description);

    // Analyze the request for clarity and completeness
    const analysis = this.performAnalysis(request);

    // Generate enhanced request
    const enhancedRequest = this.enhanceRequest(request, analysis);

    // Generate skill structure
    const methods = this.generateMethods(enhancedRequest);
    const requires = this.detectDependencies(enhancedRequest);
    const permissions = this.detectPermissions(enhancedRequest);

    // Generate skill.md content
    const markdownContent = this.generateSkillMarkdown({
      skillId,
      request: enhancedRequest,
      methods,
      requires,
      permissions,
      analysis,
    });

    return {
      originalRequest: request.description,
      enhancedRequest: enhancedRequest.description,
      improvements: analysis.improvements,
      skillId,
      skillName: this.generateSkillName(request.description),
      skillDescription: enhancedRequest.description,
      methods,
      requires,
      permissions,
      markdownContent,
    };
  }

  /**
   * Generate a complete skill schema from analysis
   */
  generateSkillSchema(result: SkillAnalysisResult): SkillSchema {
    return {
      id: result.skillId,
      name: result.skillName,
      description: result.skillDescription,
      methods: result.methods,
      requires: result.requires,
      permissions: result.permissions,
    };
  }

  /**
   * Perform deep analysis of the skill request
   */
  private performAnalysis(request: SkillRequest): {
    completeness: number;
    clarity: number;
    feasibility: number;
    improvements: string[];
    suggestions: string[];
  } {
    const improvements: string[] = [];
    const suggestions: string[] = [];

    // Check for missing information
    if (!request.purpose) {
      improvements.push('Added explicit purpose statement based on description analysis');
    }

    if (!request.targetUsers || request.targetUsers.length === 0) {
      improvements.push('Defined target user personas for better UX design');
    }

    if (!request.expectedInputs || request.expectedInputs.length === 0) {
      improvements.push('Identified expected input parameters through intent analysis');
    }

    if (!request.expectedOutputs || request.expectedOutputs.length === 0) {
      improvements.push('Defined expected output schemas for type safety');
    }

    if (!request.constraints || request.constraints.length === 0) {
      suggestions.push('Consider adding rate limiting or usage constraints');
    }

    // Analyze description quality
    const descriptionLength = request.description.length;
    if (descriptionLength < 50) {
      improvements.push('Expanded description for better context understanding');
    }

    // Check for specific keywords that indicate complexity
    const complexityIndicators = ['analyze', 'process', 'transform', 'integrate', 'orchestrate'];
    const hasComplexity = complexityIndicators.some(ind =>
      request.description.toLowerCase().includes(ind)
    );

    if (hasComplexity) {
      suggestions.push('Consider breaking complex operations into multiple methods');
    }

    return {
      completeness: this.calculateCompleteness(request),
      clarity: this.calculateClarity(request),
      feasibility: this.calculateFeasibility(request),
      improvements,
      suggestions,
    };
  }

  /**
   * Enhance the original request with missing details
   */
  private enhanceRequest(
    request: SkillRequest,
    analysis: { completeness: number; clarity: number; feasibility: number; improvements: string[]; suggestions: string[] }
  ): SkillRequest {
    return {
      description: this.enhanceDescription(request.description),
      purpose: request.purpose || this.inferPurpose(request.description),
      targetUsers: request.targetUsers || ['developers', 'ai-agents'],
      expectedInputs: request.expectedInputs || this.inferInputs(request.description),
      expectedOutputs: request.expectedOutputs || this.inferOutputs(request.description),
      constraints: request.constraints || ['rate-limited', 'validated'],
    };
  }

  /**
   * Generate methods based on the request
   */
  private generateMethods(request: SkillRequest): SkillMethod[] {
    const methods: SkillMethod[] = [];

    // Primary execute method
    methods.push({
      name: 'execute',
      description: `Main execution method for ${request.description}`,
      parameters: this.generateParameters(request.expectedInputs || []),
      returns: { type: 'object', description: 'Execution result with success flag and data' },
    });

    // Validation method
    methods.push({
      name: 'validate',
      description: 'Validate input parameters before execution',
      parameters: this.generateParameters(request.expectedInputs || []),
      returns: { type: 'object', description: 'Validation result with errors if any' },
    });

    // Add specialized methods based on keywords
    if (request.description.toLowerCase().includes('analyze')) {
      methods.push({
        name: 'analyze',
        description: 'Perform deep analysis on provided data',
        parameters: {
          data: { type: 'unknown', description: 'Data to analyze', required: true },
          options: { type: 'object', description: 'Analysis options', required: false },
        },
        returns: { type: 'object', description: 'Analysis results with insights' },
      });
    }

    if (request.description.toLowerCase().includes('transform') ||
        request.description.toLowerCase().includes('convert')) {
      methods.push({
        name: 'transform',
        description: 'Transform input data to desired format',
        parameters: {
          input: { type: 'unknown', description: 'Input data', required: true },
          format: { type: 'string', description: 'Target format', required: true },
        },
        returns: { type: 'unknown', description: 'Transformed data' },
      });
    }

    return methods;
  }

  /**
   * Generate parameter definitions
   */
  private generateParameters(inputs: string[]): Record<string, SkillParameter> {
    const params: Record<string, SkillParameter> = {};

    inputs.forEach((input, index) => {
      const paramName = this.camelCase(input.split(' ').slice(0, 2).join(' '));
      params[paramName] = {
        type: index === 0 ? 'string' : 'unknown',
        description: input,
        required: index === 0,
      };
    });

    // Add common parameters
    params.options = {
      type: 'object',
      description: 'Additional options for the operation',
      required: false,
    };

    return params;
  }

  /**
   * Detect required dependencies
   */
  private detectDependencies(request: SkillRequest): string[] {
    const deps: string[] = [];
    const desc = request.description.toLowerCase();

    if (desc.includes('http') || desc.includes('api') || desc.includes('fetch')) {
      deps.push('http-client');
    }

    if (desc.includes('file') || desc.includes('read') || desc.includes('write')) {
      deps.push('filesystem');
    }

    if (desc.includes('data') || desc.includes('parse') || desc.includes('json')) {
      deps.push('data-processor');
    }

    if (desc.includes('ai') || desc.includes('model') || desc.includes('predict')) {
      deps.push('ai-inference');
    }

    return deps.length > 0 ? deps : ['core'];
  }

  /**
   * Detect required permissions
   */
  private detectPermissions(request: SkillRequest): string[] {
    const perms: string[] = [];
    const desc = request.description.toLowerCase();

    if (desc.includes('file') || desc.includes('read')) {
      perms.push('filesystem:read');
    }

    if (desc.includes('write') || desc.includes('create')) {
      perms.push('filesystem:write');
    }

    if (desc.includes('network') || desc.includes('http') || desc.includes('api')) {
      perms.push('network:access');
    }

    if (desc.includes('execute') || desc.includes('run')) {
      perms.push('system:execute');
    }

    return perms.length > 0 ? perms : ['skill:basic'];
  }

  /**
   * Generate skill.md markdown content
   */
  private generateSkillMarkdown(config: {
    skillId: string;
    request: SkillRequest;
    methods: SkillMethod[];
    requires: string[];
    permissions: string[];
    analysis: { completeness: number; clarity: number; feasibility: number; improvements: string[]; suggestions: string[] };
  }): string {
    return `# ${config.skillId}

## Overview

**Name:** ${this.generateSkillName(config.request.description)}
**ID:** \`${config.skillId}\`
**Version:** 1.0.0

### Purpose
${config.request.purpose}

### Description
${config.request.description}

## Target Users
${config.request.targetUsers?.map(u => `- ${u}`).join('\n') || '- Developers'}

## Analysis Results

| Metric | Score |
|--------|-------|
| Completeness | ${config.analysis.completeness}% |
| Clarity | ${config.analysis.clarity}% |
| Feasibility | ${config.analysis.feasibility}% |

### Improvements Made
${config.analysis.improvements.map(i => `- ${i}`).join('\n') || '- None required'}

### Suggestions
${config.analysis.suggestions.map(s => `- ${s}`).join('\n') || '- None'}

## Methods

${config.methods.map(m => `
### ${m.name}()

**Description:** ${m.description}

**Parameters:**
${Object.entries(m.parameters).map(([name, param]) => `- \`${name}\` (${param.type}${param.required ? ', required' : ''}): ${param.description}`).join('\n')}

**Returns:** ${typeof m.returns === 'string' ? m.returns : JSON.stringify(m.returns)}
`).join('\n')}

## Dependencies

${config.requires.map(r => `- \`${r}\``).join('\n')}

## Permissions

${config.permissions.map(p => `- \`${p}\``).join('\n')}

## Usage Example

\`\`\`typescript
import { skillRegistry } from './skills';

// Invoke the skill
const result = await skillRegistry.invoke('${config.skillId}', 'execute', {
${config.request.expectedInputs?.map((input, i) => `  ${this.camelCase(input)}: /* ${input} */`).join(',\n') || '  // Input parameters'}
});

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
\`\`\`

## Integration Notes

- Register this skill with \`skillRegistry.register(skillSchema)\`
- All methods support async/await
- Validation is performed automatically before execution
- Errors are returned as { success: false, error: string }

## Changelog

### v1.0.0
- Initial skill creation via Skill Creator Agent
- Auto-generated methods based on request analysis
- Added validation and error handling
`;
  }

  // Helper methods
  private generateSkillId(description: string): string {
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(w => w.length > 2)
      .slice(0, 3);
    return words.join('-') || 'custom-skill';
  }

  private generateSkillName(description: string): string {
    const words = description.split(' ').slice(0, 4);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  private camelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private calculateCompleteness(request: SkillRequest): number {
    let score = 50; // Base score
    if (request.purpose) score += 15;
    if (request.targetUsers && request.targetUsers.length > 0) score += 10;
    if (request.expectedInputs && request.expectedInputs.length > 0) score += 10;
    if (request.expectedOutputs && request.expectedOutputs.length > 0) score += 10;
    if (request.constraints && request.constraints.length > 0) score += 5;
    return Math.min(score, 100);
  }

  private calculateClarity(request: SkillRequest): number {
    const length = request.description.length;
    if (length > 200) return 95;
    if (length > 100) return 85;
    if (length > 50) return 75;
    return 60;
  }

  private calculateFeasibility(request: SkillRequest): number {
    const complexTerms = ['ai', 'ml', 'machine learning', 'neural', 'complex'];
    const hasComplexity = complexTerms.some(t => request.description.toLowerCase().includes(t));
    return hasComplexity ? 80 : 95;
  }

  private enhanceDescription(description: string): string {
    if (description.length < 100) {
      return `${description}. This skill provides a robust, type-safe interface for handling the specified operations with built-in validation and error handling.`;
    }
    return description;
  }

  private inferPurpose(description: string): string {
    return `Automate and standardize ${description.toLowerCase()} operations with proper error handling and validation.`;
  }

  private inferInputs(description: string): string[] {
    const inputs: string[] = ['input data'];
    if (description.includes('file')) inputs.push('file path');
    if (description.includes('api')) inputs.push('API endpoint');
    if (description.includes('data')) inputs.push('data source');
    return inputs;
  }

  private inferOutputs(description: string): string[] {
    const outputs: string[] = ['result data'];
    if (description.includes('analyze')) outputs.push('analysis report');
    if (description.includes('transform')) outputs.push('transformed data');
    return outputs;
  }
}

/**
 * Global skill creator instance
 */
export const skillCreator = new SkillCreator();
