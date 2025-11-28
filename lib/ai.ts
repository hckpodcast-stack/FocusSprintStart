const OPENAI_BASE_URL = "https://api.openai.com/v1";

function getOpenAIApiKey(): string {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  console.log(
    "EXPO_PUBLIC_OPENAI_API_KEY present?",
    !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  );
  
  if (!key) {
    throw new Error(
      "Missing OpenAI API key. Set EXPO_PUBLIC_OPENAI_API_KEY in your env.",
    );
  }
  return key;
}

export async function transcribeAudio(uri: string): Promise<string | null> {
  if (!uri) return null;

  const apiKey = getOpenAIApiKey();
  const formData = new FormData();

  formData.append(
    "file",
    {
      uri,
      name: "voice-memo.m4a",
      type: "audio/m4a",
    } as any,
  );

  formData.append("model", "whisper-1");

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData as any,
  });

  if (!response.ok) {
    console.log("Transcription error", await response.text());
    return null;
  }

  const json = (await response.json()) as { text?: string };
  return json.text ?? null;
}

export async function summarizeText(text: string): Promise<string | null> {
  if (!text.trim()) return null;

  const apiKey = getOpenAIApiKey();

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive, sincere coach that helps users stick to their declared goal by reminding the users why their goals matter. You don't sugar coat things and provide the most honest feedback",
        },
        {
          role: "user",
          content: `You summarize goal-intention memos in one short sentence that resembles the tone and style of the orignal text. The summary has to be sincere and emphasizes the reasons why the users set this goal:\n\n${text}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 80,
    }),
  });

  if (!response.ok) {
    console.log("Summary error", await response.text());
    return null;
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  return content ?? null;
}

export async function getTranscriptAndSummary(options: {
  audioUri?: string | null;
  textMemo?: string | null;
}): Promise<{ transcript: string | null; summary: string | null }> {
  const { audioUri, textMemo } = options;

  let transcript: string | null = null;
  let summary: string | null = null;

  try {
    if (audioUri) {
      transcript = await transcribeAudio(audioUri);
    }
  } catch (error) {
    console.log("Failed to transcribe audio", error);
  }

  const baseText = transcript ?? textMemo ?? "";
  if (!baseText.trim()) {
    return { transcript, summary: null };
  }

  try {
    summary = await summarizeText(baseText);
  } catch (error) {
    console.log("Failed to summarize memo", error);
  }

  return { transcript, summary };
}

export async function generateInsightsForGoals(goals: {
  title: string;
  dueAt: string;
  goalType: string;
  feeling: string;
  friction: string | null;
  whySummary?: string;
  memoType: "voice" | "text" | null;
  voiceMemoTranscript?: string;
  textMemo?: string;
  reflection?: {
    emotion: string;
    satisfaction: number;
    memoType: "voice" | "text";
    voiceMemoTranscript?: string | null;
    textMemo?: string | null;
  } | null;
}[]): Promise<{
  paragraph: string | null;
  clarityScore: number | null;
  clarityExplanation: string | null;
}> {
  if (goals.length === 0) {
    return { paragraph: null, clarityScore: null, clarityExplanation: null };
  }

  const apiKey = getOpenAIApiKey();

  const serializedGoals = goals.map((goal) => ({
    title: goal.title,
    dueAt: goal.dueAt,
    goalType: goal.goalType,
    feeling: goal.feeling,
    friction: goal.friction,
    whySummary: goal.whySummary,
    memoType: goal.memoType,
    voiceMemoTranscript: goal.voiceMemoTranscript,
    textMemo: goal.textMemo,
    reflection: goal.reflection,
  }));

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an analytical yet compassionate coach who helps users understand patterns in how they pursue goals. You must be concrete, honest, and practical.",
        },
        {
          role: "user",
          content: [
            "You will receive one or more goals, each including:",
            "- goal title, due date, goal type, initial feeling, friction",
            "- why-summary or initial memo (voice transcript or text)",
            "- reflection data: emotion, satisfaction level, and reflection memo",
            "",
            "1) First, write a single short paragraph of insights (3–6 sentences) that helps the user understand their patterns, strengths, and friction points across these goals.",
            "   - If both completed and missed goals are present, explicitly contrast the patterns you see between them.",
            "   - Refer to concrete details when possible (e.g., clarity of outcome, specific obstacles mentioned).",
            "",
            "2) Second, assign a clarity score from 0–100 that captures how concrete, clear, and actionable their thinking is overall.",
            "   - Base this on the specificity of the goal, the detail of the memos, how concrete the language is, and whether there are obvious conflicts or unanswered questions.",
            "   - If there is effectively no memo text for any goal, set clarityScore to null and explanation to 'Not enough data'.",
            "",
            "Return JSON with exactly this shape:",
            '{ \"paragraph\": string | null, \"clarityScore\": number | null, \"clarityExplanation\": string | null }',
            "",
            "Here are the goals (as JSON):",
            JSON.stringify(serializedGoals),
          ].join("\n"),
        },
      ],
      temperature: 0.4,
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    console.log("Insights error", await response.text());
    return { paragraph: null, clarityScore: null, clarityExplanation: null };
  }

  try {
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return { paragraph: null, clarityScore: null, clarityExplanation: null };
    }
    const parsed = JSON.parse(content) as {
      paragraph?: string | null;
      clarityScore?: number | null;
      clarityExplanation?: string | null;
    };
    return {
      paragraph: parsed.paragraph ?? null,
      clarityScore:
        typeof parsed.clarityScore === "number"
          ? Math.max(0, Math.min(100, Math.round(parsed.clarityScore)))
          : null,
      clarityExplanation: parsed.clarityExplanation ?? null,
    };
  } catch (error) {
    console.log("Failed to parse insights response", error);
    return { paragraph: null, clarityScore: null, clarityExplanation: null };
  }
}

