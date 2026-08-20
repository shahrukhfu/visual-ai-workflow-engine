<div align="center">
  <img src="./public/banner.png" alt="Visual AI Workflow Engine Banner" width="100%" />
  
  # Visual AI Workflow Engine
  
  **Enterprise-grade, node-based LLM decision routing and durable background workflow orchestration engine.**

  [![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React Flow](https://img.shields.io/badge/React_Flow-12.0_Canvas-FF007A?style=for-the-badge&logo=react&logoColor=white)](https://reactflow.dev/)
  [![Inngest](https://img.shields.io/badge/Inngest-Durable_Engine-00E599?style=for-the-badge&logo=inngest&logoColor=black)](https://www.inngest.com/)
  [![OpenAI / OpenRouter](https://img.shields.io/badge/LLM-OpenAI_%2F_OpenRouter-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)
</div>

---

## System Overview

The Visual AI Workflow Engine is a visual programming environment that enables users to design, test, and orchestrate non-linear decision trees powered by Large Language Models (LLMs). Built on top of Next.js 16, React Flow, and Inngest, the platform translates visual node topologies into durable, fault-tolerant background execution chains.

---

## Core Capabilities

| Capability | Technical Implementation | Value Proposition |
| :--- | :--- | :--- |
| **Interactive Node Editor** | `@xyflow/react` v12 with custom node type definitions | Drag-and-drop workflow editing with dynamic handle routing |
| **Binary Decision Nodes** | Dual source handles (`YES` / `NO`) with stateful inputs | Deterministic branching based on natural language prompt evaluation |
| **Durable Execution Engine** | Inngest step functions (`step.run()`) | Zero state-loss workflow execution with automatic retry guarantees |
| **LLM Decision Agent** | OpenAI API / OpenRouter with JSON schema constraints | Reliable binary classification with structured justification traces |
| **Path Traversal Visualization** | Dynamic edge styling, animated SVG markers, and node glow states | Immediate visual feedback showing exact AI execution paths |
| **Execution Logging & Audit** | Slide-out sheet panel powered by Shadcn UI | Full auditability of evaluation steps, prompts, and timestamps |
| **Graph Serialization** | Schema-validated JSON import and export handlers | Portability, version control, and offline workflow backup |

---

## Architecture Breakdown

### Execution Sequence Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant UI as Workflow Canvas UI
    participant API as POST /api/workflow/run
    participant Inngest as Inngest Event Service
    participant Engine as executeWorkflow Step Function
    participant LLM as OpenRouter / OpenAI API

    UI->>API: Dispatch execution request (initialInput, nodes, edges)
    API->>Inngest: Publish workflow/execute.started event
    Inngest->>Engine: Trigger background step execution
    Engine->>Engine: Identify root node (no incoming edges)
    
    loop Traversal Loop (step.run)
        Engine->>LLM: Evaluate prompt condition against input context
        LLM-->>Engine: Return structured JSON { decision: "YES"|"NO", reason }
        Engine->>Engine: Match outgoing handle (YES -> Right, NO -> Bottom)
        Engine->>Engine: Record execution step trace
    end

    Engine-->>Inngest: Finalize run state & execution trace
    Inngest-->>UI: Return trace data to render animated traversal & log panel
```

---

<details>
<summary><strong>View Workflow Node Topology Architecture</strong></summary>

```mermaid
graph LR
    Root["Root Classifier<br/><i>'Is this urgent support?'</i>"]
    Support["Support Router<br/><i>'Is production down?'</i>"]
    Sales["Sales Router<br/><i>'Requesting demo?'</i>"]
    Leaf1["Urgent Ticket Queue"]
    Leaf2["General Support Queue"]
    Leaf3["Enterprise Sales Queue"]

    Root -- YES (Right Handle) --> Support
    Root -- NO (Bottom Handle) --> Sales
    Support -- YES --> Leaf1
    Support -- NO --> Leaf2
    Sales -- YES --> Leaf3
```

</details>

---

## API Specification

### 1. Trigger Workflow Execution

```http
POST /api/workflow/run
Content-Type: application/json
```

#### Request Payload
| Field | Type | Description |
| :--- | :--- | :--- |
| `initialInput` | `string` | The text context or user message evaluated by decision nodes |
| `nodes` | `Array<Node>` | Array of React Flow node objects containing prompts and positions |
| `edges` | `Array<Edge>` | Array of React Flow edge objects defining graph connections |

#### Response Example
```json
{
  "success": true,
  "runId": "run_1724158921000_a8f9b",
  "eventId": "01J5K9X0M8N7P6Q5R4S3T2U1V0",
  "message": "Workflow execution triggered successfully via Inngest"
}
```

---

<details>
<summary><strong>View Inngest Serve Endpoint Details</strong></summary>

### 2. Inngest Serve Endpoint

```http
POST /api/inngest
GET /api/inngest
PUT /api/inngest
```

Handler endpoint serving registered background functions to the Inngest executor daemon.

</details>

---

## Deployment & Setup Guide

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Environment Configuration

Create a `.env.local` file in the project root:

```ini
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=openrouter/free
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local
```

### Installation

```bash
# Clone the repository
git clone https://github.com/shahrukhfu/visual-ai-workflow-engine.git
cd visual-ai-workflow-engine

# Install project dependencies
npm install
```

### Running Locally

```bash
# Start Next.js development server
npm run dev

# (Optional) Start Inngest local dev dashboard
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive workflow editor.

---

<details>
<summary><strong>View Workflow Graph JSON Format</strong></summary>

```json
{
  "version": "1.0",
  "nodes": [
    {
      "id": "1",
      "type": "decisionNode",
      "position": { "x": 250, "y": 60 },
      "data": {
        "title": "Email Intent Classifier",
        "prompt": "Is this incoming email an urgent customer support or technical issue?"
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "sourceHandle": "yes",
      "target": "2",
      "targetHandle": "input",
      "label": "YES"
    }
  ]
}
```

</details>

---

## Verification & Production Build

To compile and validate the TypeScript codebase for production:

```bash
npm run build
```
