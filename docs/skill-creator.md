# Skill Creator - Usage Guide

The Skill Creator is an AI-powered agent that analyzes your skill requests, enhances them, and generates complete skill definitions with documentation.

## Quick Start

### Using the UI

1. Navigate to **Skills** in the OpenClaw dashboard
2. Click **"Create New Skill"**
3. Describe what you want the skill to do
4. Click **"Analyze & Enhance"**
5. Review the AI's improvements and generated skill structure
6. Click **"Register Skill"** to add it to the system

### Using the API

```typescript
import { skillCreator } from '@/skills';
import { skillRegistry } from '@/agents/skills';

// Describe your skill request
const request = {
  description: 'Analyze code files to detect security vulnerabilities',
  purpose: 'Help developers identify and fix security issues',
  targetUsers: ['developers', 'security-analysts'],
  expectedInputs: ['file path', 'code content'],
  expectedOutputs: ['vulnerability report', 'fix suggestions'],
};

// Analyze and enhance the request
const result = await skillCreator.analyzeRequest(request);

// Review improvements
console.log('Enhancements:', result.improvements);

// Generate skill schema
const schema = skillCreator.generateSkillSchema(result);

// Register the skill
skillRegistry.register(schema);

// Download skill.md
console.log(result.markdownContent);
```

## What the Skill Creator Does

### 1. Request Analysis
- Evaluates completeness, clarity, and feasibility
- Identifies missing information
- Suggests improvements

### 2. Request Enhancement
- Expands brief descriptions
- Infers missing details
- Defines target users and constraints

### 3. Skill Structure Generation
- Creates appropriate methods (execute, validate, analyze)
- Detects required dependencies
- Assigns necessary permissions

### 4. Documentation
- Generates complete skill.md file
- Includes usage examples
- Provides integration notes

## Example Requests

### Simple Request
```
"A skill to format JSON"
```

**Enhancement:**
- Adds proper description
- Includes validate and format methods
- Detects filesystem permissions
- Generates complete documentation

### Complex Request
```
A skill that analyzes code files to detect security vulnerabilities
and suggest fixes. It should support multiple languages and output
a report with severity ratings.
```

**Enhancement:**
- Creates analyze, detect, fix, and report methods
- Detects filesystem and code analysis dependencies
- Adds AI inference capability
- Generates comprehensive documentation

## Generated Skill Structure

```typescript
{
  id: 'security-analyzer',
  name: 'Security Analyzer',
  description: 'Analyzes code files to detect security vulnerabilities...',
  methods: [
    {
      name: 'execute',
      description: 'Main execution method',
      parameters: { filePath: { type: 'string', required: true } },
      returns: { type: 'object' }
    },
    {
      name: 'analyze',
      description: 'Perform deep analysis',
      parameters: { code: { type: 'string', required: true } },
      returns: { type: 'object' }
    },
    {
      name: 'validate',
      description: 'Validate inputs',
      parameters: { filePath: { type: 'string', required: true } },
      returns: { type: 'object' }
    }
  ],
  requires: ['filesystem', 'ai-inference'],
  permissions: ['filesystem:read', 'system:execute']
}
```

## Best Practices

1. **Be descriptive** - The AI can enhance better with more context
2. **Specify use case** - Mention who will use it and why
3. **List inputs/outputs** - Helps generate accurate method signatures
4. **Review enhancements** - Always check the AI's improvements
5. **Test after registration** - Invoke the skill to verify it works

## Integration with Agents

```typescript
import { AgentManager } from '@/agents/manager';

const manager = new AgentManager();

// Create an agent with the new skill
const agent = await manager.spawnAgent({
  id: 'security-agent',
  name: 'Security Analyst',
  capabilities: ['TOOL_USE', 'REASONING'],
  skills: ['security-analyzer'], // Your new skill
  // ...
});
```

## Advanced: Custom Skill Logic

After the skill is generated, you can add custom implementation:

```typescript
// In your skill implementation file
export async function execute(params: {
  filePath: string;
  options?: { severity?: 'low' | 'medium' | 'high' };
}) {
  // Your custom logic here
  const vulnerabilities = await scanFile(params.filePath);

  return {
    success: true,
    data: {
      vulnerabilities,
      report: generateReport(vulnerabilities),
    }
  };
}
```

## Troubleshooting

### Skill not registering?
- Check that all required fields are filled
- Verify the skill ID is unique
- Ensure permissions are valid

### Poor enhancements?
- Provide more context in the description
- Specify expected inputs and outputs
- Define target users

### Methods not appropriate?
- The AI infers methods from keywords
- You can edit the generated skill before registering
- Add/remove methods as needed

## Next Steps

- Explore existing skills for inspiration
- Share your skills with the community
- Build agent workflows using multiple skills
- Create skills that compose other skills
