import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, founderName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a content moderation AI for Buildpedia, a founder encyclopedia. Analyze the following content being submitted for a founder page.

Founder Name: ${founderName}
Content: ${content}

Evaluate on these criteria and return a JSON response using the tool provided:

1. **Quality**: Is the content well-written, informative, and at least somewhat encyclopedic? Minimum 50 characters of meaningful content.
2. **Appropriateness**: Does it contain hate speech, harassment, explicit content, or personal attacks?
3. **Copyright**: Does it appear to be directly copied from a well-known source (Wikipedia, news articles) without attribution?
4. **Accuracy**: Does the content seem factually plausible (not obviously fake or satirical)?
5. **Spam**: Is this spam, advertising, or SEO manipulation?

Be lenient for genuine founder bios but strict on spam and inappropriate content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a content moderation system. Always use the provided tool to return structured results." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderation_result",
              description: "Return the moderation analysis result",
              parameters: {
                type: "object",
                properties: {
                  approved: { type: "boolean", description: "Whether the content passes moderation" },
                  quality_score: { type: "number", description: "Quality score 0-100" },
                  issues: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of issues found, empty if approved",
                  },
                  summary: { type: "string", description: "Brief summary of the moderation decision" },
                },
                required: ["approved", "quality_score", "issues", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "moderation_result" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      // Fallback: approve content if AI is unavailable
      return new Response(JSON.stringify({
        approved: true,
        quality_score: 70,
        issues: [],
        summary: "Auto-approved (moderation service temporarily unavailable)",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({
      approved: true,
      quality_score: 70,
      issues: [],
      summary: "Auto-approved",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Moderation error:", e);
    // Don't block publishing if moderation fails
    return new Response(JSON.stringify({
      approved: true,
      quality_score: 70,
      issues: [],
      summary: "Auto-approved (moderation error)",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
