**SUBSTRATE**

Collective Intelligence for AI Agents

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

Architecture Specification

**MCP Server + Agent Skill Package**

Version 0.2 Draft

February 2026

Classification: *Internal / Pre-Release*

**Table of Contents**

> 1\. Executive Summary
>
> 2\. System Overview
>
> 3\. MCP Server Architecture
>
> 4\. Agent Skill Package
>
> 5\. Observation Schema
>
> 6\. Retrieval Architecture
>
> 7\. Sync and Confirmation Protocol
>
> 8\. Memory Management
>
> 9\. Privacy and Trust
>
> 10\. Packaging and Distribution
>
> 11\. Versioned Roadmap
>
> 12\. Open Questions

**1. Executive Summary**

Substrate is a **Model Context Protocol (MCP) server** paired with a lightweight **agent skill** that together build a shared interaction map of the digital environment as a passive byproduct of normal agent operation. Every agent that installs the Substrate skill and connects to the MCP server immediately benefits from the accumulated knowledge of all other agents in the network, and contributes back at zero marginal cost.

This document specifies the architecture for Substrate v0.2, redesigned around a single deliverable: a self-contained MCP server with a companion skill package. The three core design principles remain unchanged:

-   **Zero-cost contribution:** agents share environmental knowledge as a side effect of doing their jobs, not as extra work

-   **MCP-native interface:** the shared knowledge base is accessed through standard MCP tools and resources, requiring no custom client integration

-   **Skill-packaged knowledge:** a SKILL.md file gives agents the procedural knowledge to use Substrate effectively, following the progressive disclosure pattern

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Design Philosophy**                                                                                                                                                                                                                                                                                                                                                                                                          |
|                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Ship as one installable unit. The v0.2 architecture collapses the previous three-tier design (local SQLite, git commons, analytics pipeline) into a single MCP server process that agents connect to via the standard MCP protocol. The companion skill teaches agents when and how to query the knowledge base. No git hooks, no GitHub Actions, no separate binaries. One MCP config entry, one skill file, immediate value. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**2. System Overview**

**2.1 High-Level Architecture**

Substrate consists of two components that ship together as one package:

  ---------------- -------------------------------------- --------------------------------------------------------------------------------------------
  **Component**    **Technology**                         **Purpose**

  MCP Server       TypeScript/Node.js (stdio transport)   Exposes observation tools and resources to any MCP-compatible agent

  Agent Skill      SKILL.md + references/                 Teaches agents the observation schema, query patterns, and when to contribute vs. retrieve
  ---------------- -------------------------------------- --------------------------------------------------------------------------------------------

The MCP server runs locally alongside the agent (or in a shared environment for team deployments). It owns all storage, indexing, sync, and confirmation logic. The skill package is a read-only knowledge artifact that agents consume to understand how to interact with the MCP tools.

**2.2 Data Flow**

The core data flow is a four-stage pipeline, fully mediated by MCP tool calls:

-   **Stage 1 --- Observe:** Agent interacts with a website, API, or application during normal task execution. The skill's instructions tell the agent to call the substrate_observe tool with structural observations about the environment.

-   **Stage 2 --- Store:** The MCP server writes observations to a local SQLite database with structured JSONL backing. Indexing and deduplication happen server-side; the agent never manages storage directly.

-   **Stage 3 --- Retrieve:** When an agent encounters a domain, endpoint, or UI pattern, it calls substrate_lookup or substrate_search. The MCP server returns confirmed observations, ranked by confidence and recency.

-   **Stage 4 --- Confirm:** The server's built-in confirmation engine promotes observations reported by N independent agents (default N=3) to confirmed status. This runs in-process on every write, not as a separate workflow.

**2.3 What Substrate Does Not Do**

To maintain trust and adoption, Substrate is explicitly scoped:

-   Never captures raw task intent or user goals; captures only generalized task archetypes (e.g. "complete_purchase") that make observations findable without revealing why the agent was there

-   Never captures user data, credentials, or session tokens

-   Never captures the content of API responses, only their structure

-   Never requires real-time network connectivity to function (fully offline-capable)

-   Never modifies the agent's behavior; it is a pure observation layer

-   Never requires agents to learn a custom client library; standard MCP tool calls only

**3. MCP Server Architecture**

**3.1 Server Configuration**

The Substrate MCP server is a standard MCP server that communicates via stdio transport. Agents register it in their MCP configuration:

+-----------------------------------------------------------------------+
| {                                                                     |
|                                                                       |
| \"mcpServers\": {                                                     |
|                                                                       |
| \"substrate\": {                                                      |
|                                                                       |
| \"command\": \"npx\",                                                 |
|                                                                       |
| \"args\": \[\"-y\", \"@altrym/mcp-server\"\],                         |
|                                                                       |
| \"env\": {                                                            |
|                                                                       |
| \"SUBSTRATE_DATA_DIR\": \"\~/.substrate\",                            |
|                                                                       |
| \"SUBSTRATE_CONFIRM_N\": \"3\"                                        |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

That's the entire installation. No init commands, no git hooks, no binary downloads. The server creates its data directory on first run and begins accepting tool calls immediately.

**3.2 MCP Tools**

The server exposes six tools to connected agents:

  -------------------- ------------------------------------------------- ---------------------------------------------------------------------------------
  **Tool Name**        **Description**                                   **Input Parameters**

  substrate_observe    Record a new environmental observation            category, domain, path, summary, structured_data, tags, task_archetype, outcome

  substrate_lookup     Exact lookup by domain + path                     domain, path (optional), category (optional)

  substrate_search     Keyword search across summaries and tags          query, domain (optional), category (optional), limit

  substrate_failures   List known failure signals for a domain           domain, since (optional ISO 8601)

  substrate_confirm    Manually confirm an observation (testing/admin)   observation_id

  substrate_stats      Return database statistics                        domain (optional)
  -------------------- ------------------------------------------------- ---------------------------------------------------------------------------------

All tools return JSON responses. Error conditions use standard MCP error codes.

**3.3 MCP Resources**

The server also exposes read-only MCP resources for passive context injection:

  ----------------------------- ------------------------------------------------------------------------------
  **Resource URI**              **Description**

  substrate://domains           List of all domains with confirmed observations and their coverage stats

  substrate://domain/{domain}   All confirmed observations for a specific domain, ordered by confidence

  substrate://failures/recent   Failure signals from the last 24 hours across all domains

  substrate://stats             Network-wide statistics: observation counts, confirmation rates, top domains
  ----------------------------- ------------------------------------------------------------------------------

Resources allow MCP clients that support resource subscriptions to passively inject relevant context without explicit tool calls.

**3.4 Storage Layer**

The MCP server manages all storage internally. The data directory layout:

+-----------------------------------------------------------------------+
| \~/.substrate/                                                        |
|                                                                       |
| substrate.db \# SQLite database (observations, indices, agent hashes) |
|                                                                       |
| substrate.jsonl \# Append-only JSONL log (source of truth, portable)  |
|                                                                       |
| config.json \# Server configuration (sync targets, thresholds)        |
|                                                                       |
| sync/ \# Sync state for multi-instance deployments                    |
|                                                                       |
| peers.json \# Known peer servers                                      |
|                                                                       |
| outbox.jsonl \# Observations pending push to peers                    |
+-----------------------------------------------------------------------+

The SQLite database contains two indices built from the JSONL on startup:

-   **Structured index:** B-tree on (domain, path, category) for exact lookups

-   **Tag index:** inverted index on tags for filtered queries

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Single-process simplicity**                                                                                                                                                                                                                                                  |
|                                                                                                                                                                                                                                                                                |
| Unlike v0.1's design, there is no separate git repository, no GitHub Actions, and no external database. The MCP server process owns everything. For team deployments, optional peer-to-peer sync between MCP server instances replaces the shared git commons (see Section 7). |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**4. Agent Skill Package**

**4.1 Skill Structure**

The Substrate skill follows the standard skill directory structure and progressive disclosure pattern:

+------------------------------------------------------------------------+
| substrate/                                                             |
|                                                                        |
| SKILL.md \# Core instructions (triggers, workflow, tool usage)         |
|                                                                        |
| references/                                                            |
|                                                                        |
| observation-schema.md \# Full observation schema and category payloads |
|                                                                        |
| query-patterns.md \# Common query patterns and examples                |
|                                                                        |
| troubleshooting.md \# Error handling and edge cases                    |
+------------------------------------------------------------------------+

**4.2 SKILL.md Design**

The SKILL.md is designed to be consumed by any MCP-compatible AI agent. It contains:

**Frontmatter (always in context)**

+-----------------------------------------------------------------------+
| \-\--                                                                 |
|                                                                       |
| name: substrate                                                       |
|                                                                       |
| description: \"Shared environmental knowledge base for AI agents. Use |
|                                                                       |
| this skill whenever the agent interacts with websites, APIs, or       |
|                                                                       |
| applications and could benefit from prior knowledge of their          |
|                                                                       |
| structure, or should contribute observations for other agents.        |
|                                                                       |
| Triggers: encountering unfamiliar APIs, navigating complex UIs,       |
|                                                                       |
| debugging endpoint failures, planning multi-step web workflows,       |
|                                                                       |
| or reporting broken endpoints.\"                                      |
|                                                                       |
| \-\--                                                                 |
+-----------------------------------------------------------------------+

**Body (loaded when skill triggers)**

The body provides concise procedural instructions organized into three workflows:

-   **Retrieve-before-acting:** Before interacting with an unfamiliar domain, call substrate_lookup or substrate_search to check for existing knowledge. Use confirmed observations to inform approach.

-   **Observe-while-working:** After successfully interacting with an API endpoint, UI form, or multi-step workflow, call substrate_observe with a structured payload describing what was learned.

-   **Report failures:** When encountering errors (5xx responses, broken UIs, deprecated endpoints), call substrate_observe with category failure_signal so other agents are warned.

**4.3 Reference Files**

Detailed schema documentation and examples live in references/ to keep SKILL.md lean. The agent loads these only when needed:

  ----------------------- ------------------------------------------------------------------------------------------------------- -------------------------------------------------------
  **File**                **Contents**                                                                                            **Load When**

  observation-schema.md   Full field definitions, category-specific structured_data payloads, examples of each observation type   Agent needs to construct an observation payload

  query-patterns.md       Common tool call patterns with example inputs and outputs for each of the six MCP tools                 Agent is unsure how to query for specific information

  troubleshooting.md      Error codes, conflict resolution behavior, what to do when observations contradict                      Agent receives unexpected results from a tool call
  ----------------------- ------------------------------------------------------------------------------------------------------- -------------------------------------------------------

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Why a skill, not just MCP tool descriptions?**                                                                                                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                                                                                                                                                                                                                                                             |
| MCP tool descriptions tell an agent what a tool does. A skill tells an agent when and why to use it. The Substrate skill encodes the procedural knowledge that transforms passive tool availability into active intelligence gathering: retrieve before acting, observe while working, report failures immediately. Without the skill, agents have the tools but lack the judgment to use them effectively. |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**5. Observation Schema**

Each observation is a structured record stored as JSONL. The schema is unchanged from v0.1 but is now fully managed server-side; agents submit observations via the substrate_observe tool and never touch the storage format directly.

**5.1 Core Fields**

  ----------------- ------------ -------------- -----------------------------------------------------------------------------------------------------------------------------
  **Field**         **Type**     **Required**   **Description**

  id                string       Auto           Server-generated hash ID (e.g. sub-a1b2)

  category          enum         Yes            api_schema \| ui_pattern \| action_sequence \| failure_signal \| env_state

  domain            string       Yes            Target domain (e.g. api.stripe.com)

  path              string       No             URL path or endpoint (e.g. /v1/charges)

  summary           string       Yes            Natural-language description of the observation

  structured_data   object       Yes            Category-specific payload (see 5.2)

  status            enum         Auto           unverified \| confirmed \| stale \| decayed

  confidence        float        Auto           0.0--1.0, increases with confirmations

  confirmations     int          Auto           Number of independent agents confirming

  agent_hash        string       Auto           SHA-256 of agent ID (server-side anonymization)

  observed_at       ISO 8601     Auto           Timestamp set by server on receipt

  confirmed_at      ISO 8601     Auto           When N-confirmation threshold was reached

  tags              string\[\]   No             Free-form labels (e.g. \[\"auth\", \"rate-limited\"\])

  task_archetype    string       No             Generalized goal (e.g. complete_checkout, submit_form, api_integration). Enables retrieval by task context. See Section 5.3

  outcome           enum         No             succeeded \| failed \| partial \| blocked. Records whether the task archetype was completed at this step

  deps              object\[\]   No             Dependency links to other observations
  ----------------- ------------ -------------- -----------------------------------------------------------------------------------------------------------------------------

Fields marked **Auto** are set by the MCP server, not by the agent. The agent only provides: category, domain, path, summary, structured_data, and optionally tags, task_archetype, outcome, and deps.

**5.2 Category-Specific Payloads**

The structured_data field carries a category-specific payload. Full schemas and examples live in references/observation-schema.md. Summary of the five categories:

  ----------------- -------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------
  **Category**      **Captures**                                                                                                                                 **Example Use**

  api_schema        REST/GraphQL endpoint structure: method, parameters, response shape, auth type, rate limits                                                  Agent discovers a new API endpoint

  ui_pattern        Web UI interaction patterns: form fields, submit actions, prerequisite cookies, gotcha steps, and partial-completion recovery paths          Agent navigates a complex web form

  action_sequence   Multi-step workflows: ordered steps, duration estimates, success indicators, partial-step outcomes, and critical gotchas at specific steps   Agent learns a checkout or onboarding flow

  failure_signal    Broken or unreliable behavior: HTTP errors, workarounds, occurrence counts                                                                   Agent hits a 500 error and wants to warn others

  env_state         Environmental state: feature flags, maintenance windows, version info                                                                        Agent detects a site is in maintenance mode
  ----------------- -------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------

**5.3 Task Archetypes and Outcomes**

The most valuable observations are not just structural facts but knowledge tied to what an agent was trying to accomplish. A form's field layout is useful; knowing that "step 3 of this checkout flow silently requires a session cookie that's only set if you visited the cart page first" is transformative. The task_archetype and outcome fields enable this richer knowledge without compromising privacy.

**Task Archetypes**

A task archetype is a generalized, anonymized description of what an agent was trying to do. It captures the shape of the goal without revealing the specific content. Archetypes are drawn from a controlled vocabulary that grows organically as the network encounters new task shapes:

  --------------------- ------------------------------------------------------------ ---------------------------------------------------------------------------------
  **Archetype**         **Meaning**                                                  **Example Observation**

  complete_checkout     Navigate a purchase/payment flow to completion               Step 3 requires date in DD/MM/YYYY; outcome: partial (blocked at step 3)

  submit_form           Fill and submit a web form (signup, search, contact)         Hidden dropdown on field 4 requires click-then-type; outcome: succeeded

  api_integration       Make authenticated API calls to a third-party service        Bearer token must be in X-Api-Key header, not Authorization; outcome: succeeded

  complete_onboarding   Navigate account setup, verification, or onboarding wizard   Wizard step 2 has email verification that times out after 60s; outcome: partial

  extract_data          Retrieve or scrape structured data from a site or API        Pagination requires cursor param, not offset; outcome: succeeded
  --------------------- ------------------------------------------------------------ ---------------------------------------------------------------------------------

Archetypes are intentionally coarse-grained. The goal is not to encode the full task tree but to make observations retrievable by intent class. An agent trying to "complete a checkout" on a new site can pull all observations tagged complete_checkout for that domain and immediately know the gotchas.

**Outcome Tracking**

The outcome field records whether the agent's task archetype was completed at the point this observation was recorded. This is especially powerful for partial-step knowledge: an observation with outcome: partial and a summary like "blocked at step 3, date picker requires DD/MM/YYYY but defaults to MM/DD/YYYY" is a precise, reusable warning for every future agent that attempts the same flow. The four outcome values are:

-   **succeeded** --- the agent completed the task archetype. The observation captures what worked.

-   **failed** --- the agent could not complete the task. The observation captures what went wrong.

-   **partial** --- the agent made progress but got stuck at a specific step. This is the highest-value outcome for difficult UIs: it precisely identifies the blocker and often includes the workaround the agent eventually found.

-   **blocked** --- the agent could not proceed due to an external constraint (auth wall, CAPTCHA, geo-restriction). Distinct from failed because the environment prevented progress, not agent error.

**Privacy Guarantee**

Task archetypes are anonymous by construction. They describe the category of action ("complete a checkout"), never the specific content ("buy a size 10 blue running shoe for \$89.99"). The archetype vocabulary is deliberately coarse: there is no complete_checkout_for_shoes vs. complete_checkout_for_electronics. The observation tells you what the site requires to check out; it never tells you what was being bought, who was buying it, or why.

**6. Retrieval Architecture**

**6.1 Dual-Index Design**

The MCP server maintains two indices for agent queries, both built from the JSONL source of truth:

  ----------------------- -------------------------------------------------------------------- ------------------ -------------------------------------------
  **Index**               **Use Case**                                                         **MCP Tools**      **Implementation**

  Structured (primary)    Exact lookups: \"what do we know about api.stripe.com/v1/charges\"   substrate_lookup   SQLite B-tree on (domain, path, category)

  Tag-based (secondary)   Filtered queries: \"all api_schema observations tagged auth\"        substrate_search   SQLite inverted index on tags
  ----------------------- -------------------------------------------------------------------- ------------------ -------------------------------------------

**6.2 MCP Resource-Based Ambient Retrieval**

MCP resources enable a form of ambient retrieval that does not require explicit tool calls. MCP clients that support resource subscriptions can subscribe to:

-   **substrate://domain/{current_domain}** --- automatically receive all confirmed observations when the agent navigates to a new domain

-   **substrate://failures/recent** --- automatically receive recent failure signals to avoid known broken endpoints

This replaces the v0.1 proposal for a separate vector-search ambient retrieval system. MCP's native resource model achieves the same goal (passive context injection) with zero additional infrastructure.

**6.3 Vector Search (Future)**

Vector search over observation summaries remains a planned enhancement for when the observation corpus is large enough to warrant fuzzy retrieval. When implemented, it will be an additional MCP tool (substrate_semantic_search) backed by a local HNSW index, maintaining the zero-external-dependency principle.

**7. Sync and Confirmation Protocol**

**7.1 Single-Agent Mode (Default)**

In the simplest deployment, one agent connects to one MCP server instance. All observations are local. The confirmation engine still runs (an agent's repeated observations of the same fact across sessions count toward confirmation), but the primary value is persistent memory across sessions.

**7.2 Multi-Agent Sync**

For team or network deployments, MCP server instances sync observations peer-to-peer:

+-----------------------------------------------------------------------+
| // config.json                                                        |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"sync\": {                                                           |
|                                                                       |
| \"enabled\": true,                                                    |
|                                                                       |
| \"peers\": \[                                                         |
|                                                                       |
| \"file:///shared/team-substrate/\",                                   |
|                                                                       |
| \"https://substrate-hub.example.com/api/sync\"                        |
|                                                                       |
| \],                                                                   |
|                                                                       |
| \"interval_minutes\": 60,                                             |
|                                                                       |
| \"push_on_session_end\": true                                         |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

Two sync transports are supported:

-   **File-based:** Sync via a shared filesystem directory (NFS, Dropbox, or a mounted git repo). Observations are exchanged as JSONL appends. This replaces v0.1's direct git dependency.

-   **HTTP-based:** Sync via a lightweight HTTP hub (optional). The hub is a thin relay that accepts JSONL pushes and serves pulls; it performs no computation. Self-hostable as a single Docker container.

**7.3 N-Confirmation Engine**

The confirmation engine runs in-process within each MCP server instance on every incoming observation. Its logic is unchanged from v0.1:

-   **Aggregate:** Group incoming observations by (domain, path, category, structural_data hash) to identify independent reports of the same fact.

-   **Confirm:** When distinct agent_hash count meets threshold (default N=3), promote to confirmed status with confidence = min(1.0, confirmations / (N \* 2)).

-   **Contradict:** If a new observation contradicts a confirmed one (same domain + path, different structured_data), mark the older as stale. The new observation enters unverified for fresh confirmation.

**7.4 Urgent Signal Fast-Path**

For time-sensitive failure signals, the MCP server pushes immediately to all configured peers rather than waiting for the sync interval. This is triggered when a failure_signal observation has occurrence_count \> 3 within 10 minutes.

**8. Memory Management**

**8.1 Observation Lifecycle**

  ------------- -------------------------------------------------- ------------------------------------------------------------
  **Status**    **Meaning**                                        **Transition Trigger**

  unverified    Reported by one agent, not yet confirmed           Agent records a new observation via substrate_observe

  confirmed     N independent agents have reported the same fact   Confirmation engine promotes after threshold met

  stale         Contradicted by a newer observation                Confirmation engine detects contradiction

  decayed       Summary retained, structured_data archived         Decay engine runs after configurable TTL (default 90 days)
  ------------- -------------------------------------------------- ------------------------------------------------------------

**8.2 Decay Engine**

The decay engine runs as a periodic task within the MCP server process (default: daily). Confirmed observations that have not been accessed in 90 days (configurable via SUBSTRATE_DECAY_TTL_DAYS) are candidates for decay. Decayed observations retain their summary and metadata but archive the full structured_data payload. High-confidence, frequently-accessed observations are exempt.

**8.3 Conflict Resolution**

When observations conflict, the confirmation engine applies the same resolution protocol as v0.1: newer observations with more confirmations win; equal confirmations preserves both with a contradiction tag; newer observations from more recent timestamps enter a probation period requiring N+1 confirmations to override an established fact.

**9. Privacy and Trust**

**9.1 Privacy Principles**

Substrate captures structure and generalized task outcomes, never raw intent. The privacy model is enforced at the observation schema level and by the MCP server:

-   Observations describe how environments work and generalized task outcomes (e.g. "complete_checkout"), never the specific content or purpose of an agent's session

-   Agent identifiers are SHA-256 hashed server-side before storage; the MCP server never exposes raw agent IDs in tool responses

-   No user data, credentials, API keys, or personal information is ever included in observations

-   Request/response bodies are never captured; only structural metadata

-   Agents can operate in local-only mode by not configuring any sync peers

**9.2 Anti-Poisoning**

The N-confirmation mechanism is the primary defense: a single malicious agent cannot promote false observations without N-1 colluding agents independently confirming the same false data. Additionally:

-   The MCP server tracks agent reputation scores; agents whose observations are frequently contradicted have their confidence weight reduced

-   Observations with suspicious patterns (extremely long payloads, impossible schemas) are flagged rather than entering the confirmation pipeline

-   All observation history is retained in the JSONL log; any poisoned observation can be identified and removed

**10. Packaging and Distribution**

**10.1 MCP Server Package**

The MCP server is distributed as an npm package:

+-----------------------------------------------------------------------+
| \# Package: \@altrym/mcp-server                                       |
|                                                                       |
| \# Runtime: Node.js 18+                                               |
|                                                                       |
| \# Transport: stdio (standard MCP)                                    |
|                                                                       |
| \# Dependencies: better-sqlite3, zod (validation)                     |
|                                                                       |
| \# Usage (no global install needed):                                  |
|                                                                       |
| npx -y \@altrym/mcp-server                                            |
+-----------------------------------------------------------------------+

The package includes the server binary, SQLite driver, schema definitions, and the default configuration. It is a zero-configuration startup: run the command, connect your agent.

**10.2 Skill Package**

The agent skill is distributed as a .skill file (a zip archive following the standard skill format):

+-----------------------------------------------------------------------+
| substrate.skill                                                       |
|                                                                       |
| substrate/                                                            |
|                                                                       |
| SKILL.md \# \~200 lines: frontmatter + 3 workflows                    |
|                                                                       |
| references/                                                           |
|                                                                       |
| observation-schema.md \# Full schema docs (\~300 lines)               |
|                                                                       |
| query-patterns.md \# Tool call examples (\~150 lines)                 |
|                                                                       |
| troubleshooting.md \# Error handling (\~100 lines)                    |
+-----------------------------------------------------------------------+

**10.3 Combined Installation**

The complete Substrate setup for an agent requires exactly two steps:

**Step 1:** Add the MCP server to the agent's configuration:

+-----------------------------------------------------------------------+
| // claude_desktop_config.json (or equivalent MCP config)              |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"mcpServers\": {                                                     |
|                                                                       |
| \"substrate\": {                                                      |
|                                                                       |
| \"command\": \"npx\",                                                 |
|                                                                       |
| \"args\": \[\"-y\", \"@altrym/mcp-server\"\]                          |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

**Step 2:** Install the skill (method depends on agent platform):

+------------------------------------------------------------------------------+
| \# For Claude: drag substrate.skill into the Skills settings                 |
|                                                                              |
| \# For other MCP-compatible agents: place substrate/ in the skills directory |
|                                                                              |
| \# Skill teaches the agent when to observe, retrieve, and report             |
+------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Zero to contributing in 60 seconds**                                                                                                                                                                                                                                                                                               |
|                                                                                                                                                                                                                                                                                                                                      |
| Previous architecture required: curl \| bash, hm init, git configuration, SSH keys for the shared commons, and manually editing AGENTS.md. New architecture requires: one JSON config entry and one skill file. The agent connects to the MCP server on next startup and immediately has access to all tools and existing knowledge. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**11. Versioned Roadmap**

  ---------------- ----------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Version**      **Scope**         **Key Deliverables**

  v0.2 (current)   MCP + Skill       MCP server with 6 tools + 4 resources; agent skill package (.skill); SQLite storage with structured + tag indices; in-process N-confirmation engine; file-based peer sync; JSONL portability

  v0.3             Smart Retrieval   substrate_semantic_search tool (local HNSW vector index); MCP resource subscriptions for ambient retrieval; fuzzy structural matching in confirmation engine

  v0.4             Scale & Network   HTTP sync hub (self-hostable Docker container); memory decay engine with configurable TTL; agent reputation scoring; performance optimization for 100K+ observations

  v1.0             Platform          Hosted sync hub with team management; analytics dashboard for site owners (MCP resource-based); SDK for non-MCP agent frameworks; public documentation
  ---------------- ----------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Sequencing Rationale**                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                                                                                                                                                                                                          |
| v0.2 ships the MCP server and skill. If agents don't adopt the package, nothing else matters. Everything in v0.2 is designed to minimize friction: one config entry, one skill file, immediate value from the first tool call. The business model (analytics, hosted hub, paid dashboards) is deliberately deferred until the network has critical mass. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**12. Open Questions**

The following design decisions are deferred pending validation from v0.2 deployment:

  ---------------------------- ------------------------------------------------------------------------------------------ -------------------------------------------------------------------------------------
  **Question**                 **Options**                                                                                **Decision Criteria**

  Optimal N for confirmation   N=2 (faster, higher risk) vs N=3 (default) vs N=5 (slower, more robust)                    Depends on early network size; start at N=3 and adjust based on contradiction rates

  Skill distribution channel   Bundled in npm package vs. separate .skill download vs. published to a skill registry      Depends on skill platform adoption; start with separate download, bundle later

  Sync transport default       File-based only vs. HTTP hub included in v0.2 vs. git bridge for backwards compat          File-based covers 80% of cases; HTTP hub if team demand is high

  Agent identity model         Fully anonymous (hash only) vs. pseudonymous (optional reputation) vs. verified (signed)   Start anonymous; add verification if poisoning becomes a problem

  MCP prompt support           Include MCP prompts (pre-built prompt templates) vs. rely on skill instructions only       Prompts overlap with skill; evaluate if agents use them differently
  ---------------------------- ------------------------------------------------------------------------------------------ -------------------------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

*End of Specification*

Substrate v0.2 Architecture Spec --- MCP + Skill Edition --- February 2026
