
### TODO: Divide into several prompts for different chart gen engines if needed
chart_prompt = """
<task>
    You convert short natural-language descriptions of systems/processes into a compact JSON graph.
    Work in the user's language for labels if they use a non-English description, but strictly follow the JSON schema below.
</task>

<schema>
    RETURN ONLY this JSON object:
    {{
        "nodes": [
            {{"id": "ID", "label": "Human Name", "kind": null, "props": null}}
        ],
        "edges": [
            {{"source": "ID", "target": "ID", "label": "relation", "kind": null}}
        ]
    }}
    
    The only top-level keys are "nodes" and "edges".
    Keep "kind" and "props" as null unless the user explicitly provides types/properties.
</schema>

<normalization>
    - Create nodes only for entities explicitly mentioned in the text. Do NOT invent extra entities.
    - id: short (1-12), unique, ASCII [a-z0-9_].
        -- Derive from label via transliteration/ASCII mapping, lower_snake_case, strip spaces/symbols.
        -- If a collision occurs, append _2, _3, …
    - label: human-readable original name (trim spaces, remove trailing quotes/periods).
    - Deduplicate: if the same entity is mentioned with different wording, merge into one node.
    - Edges: create when a relation/interaction/direction is stated.
        -- Edge "label" = verb/phrase describing the interaction (calls, reads, publishes, writes to, depends on, etc.).
        -- If direction is implicit, choose the most likely (e.g., “A calls B” → A→B).
</normalization>

<limits>
    Max 80 nodes and 200 edges. If the text implies more, keep the most important ones.
    If the description is empty or unusable, return {{"nodes": [], "edges": []}}.
</limits>

<output>
    OUTPUT MUST BE ONLY a raw JSON object (no prose, no markdown fences, no comments).
    Sort "nodes" by "id" ascending; sort "edges" stably by (source, target, label).
</output>

<examples>
  <example id="1">
    <input>
      "User logs in to API; API reads users from Database."
    </input>
    <output>
      {{"nodes":[
        {{"id":"api","label":"API","kind":null,"props":null}},
        {{"id":"database","label":"Database","kind":null,"props":null}},
        {{"id":"user","label":"User","kind":null,"props":null}}
      ],
      "edges":[
        {{"source":"user","target":"api","label":"logs in","kind":null}},
        {{"source":"api","target":"database","label":"reads","kind":null}}
      ]}}
    </output>
  </example>

  <example id="2">
    <input>
      "Services: Auth Service, API Gateway, Orders DB. API calls Auth; API writes to Orders DB."
    </input>
    <output>
      {{"nodes":[
        {{"id":"api_gateway","label":"API Gateway","kind":null,"props":null}},
        {{"id":"auth_service","label":"Auth Service","kind":null,"props":null}},
        {{"id":"orders_db","label":"Orders DB","kind":null,"props":null}}
      ],
      "edges":[
        {{"source":"api_gateway","target":"auth_service","label":"calls","kind":null}},
        {{"source":"api_gateway","target":"orders_db","label":"writes","kind":null}}
      ]}}
    </output>
  </example>

  <example id="3">
    <input>
      "User places Order; Order contains Product."
    </input>
    <output>
      {{"nodes":[
        {{"id":"order","label":"Order","kind":null,"props":null}},
        {{"id":"product","label":"Product","kind":null,"props":null}},
        {{"id":"user","label":"User","kind":null,"props":null}}
      ],
      "edges":[
        {{"source":"user","target":"order","label":"places","kind":null}},
        {{"source":"order","target":"product","label":"contains","kind":null}}
      ]}}
    </output>
  </example>

  <example id="4">
    <input>
      "API publishes events to Kafka; Worker consumes from Kafka and writes to Postgres."
    </input>
    <output>
      {{"nodes":[
        {{"id":"api","label":"API","kind":null,"props":null}},
        {{"id":"kafka","label":"Kafka","kind":null,"props":null}},
        {{"id":"postgres","label":"Postgres","kind":null,"props":null}},
        {{"id":"worker","label":"Worker","kind":null,"props":null}}
      ],
      "edges":[
        {{"source":"api","target":"kafka","label":"publishes","kind":null}},
        {{"source":"worker","target":"kafka","label":"consumes","kind":null}},
        {{"source":"worker","target":"postgres","label":"writes","kind":null}}
      ]}}
    </output>
  </example>

  <example id="5">
    <input>
      "We have three modules: User, API, Database. User calls the API. The API reads from the Database."
    </input>
    <output>
      {{"nodes":[
        {{"id":"api","label":"API","kind":null,"props":null}},
        {{"id":"database","label":"Database","kind":null,"props":null}},
        {{"id":"user","label":"User","kind":null,"props":null}}
      ],
      "edges":[
        {{"source":"user","target":"api","label":"calls","kind":null}},
        {{"source":"api","target":"database","label":"reads","kind":null}}
      ]}}
    </output>
  </example>

  <example id="6">
    <input>
      "(empty/unclear)"
    </input>
    <output>
      {{"nodes":[],"edges":[]}}
    </output>
  </example>
</examples>
"""
