import { describe, it, expect } from "vitest";
import { extractModelTemplateValue, parseDynamicAgentForForm } from "./agent_type_utils";
import type { AgentCreateInfo } from "@/components/networking";
import type { Agent } from "@/components/agents/types";

const AGENTCORE_ARN = "arn:aws:bedrock-agentcore:eu-central-1:123456789012:runtime/hosted_agent_4vm3i-BaTdfOELAs";

const agentcoreInfo: AgentCreateInfo = {
  agent_type: "bedrock_agentcore",
  agent_type_display_name: "Bedrock AgentCore",
  model_template: "bedrock/agentcore/{agent_runtime_arn}",
  credential_fields: [
    { key: "agent_runtime_arn", label: "Agent Runtime ARN", required: true, include_in_litellm_params: false },
  ],
};

describe("extractModelTemplateValue", () => {
  it("keeps every slash-separated segment of the placeholder value", () => {
    expect(
      extractModelTemplateValue(
        "bedrock/agentcore/{agent_runtime_arn}",
        `bedrock/agentcore/${AGENTCORE_ARN}`,
        "agent_runtime_arn",
      ),
    ).toBe(AGENTCORE_ARN);
  });

  it("returns undefined when the model does not match the template prefix", () => {
    expect(extractModelTemplateValue("langgraph/{assistant_id}", "langflow/flow_1", "assistant_id")).toBeUndefined();
  });

  it("returns undefined when the placeholder is not in the template", () => {
    expect(extractModelTemplateValue("langgraph/{assistant_id}", "langgraph/asst_1", "flow_id")).toBeUndefined();
  });
});

describe("parseDynamicAgentForForm", () => {
  it("populates the full AgentCore runtime ARN from the stored model", () => {
    const agent = {
      agent_id: "agent-3",
      agent_name: "ac-agent",
      litellm_params: { custom_llm_provider: "bedrock", model: `bedrock/agentcore/${AGENTCORE_ARN}` },
    } as unknown as Agent;

    expect(parseDynamicAgentForForm(agent, agentcoreInfo).agent_runtime_arn).toBe(AGENTCORE_ARN);
  });
});
