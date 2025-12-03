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

export async function generateReminderMessages(options: {
  baseText: string;
  goalTitle: string;
  timeWindow?: string | null;
  count: number;
}): Promise<string[]> {
  const { baseText, goalTitle, timeWindow, count } = options;
  if (!baseText.trim() || count <= 0) return [];

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
            "You write short, emotionally engaging but supportive push notification messages that help users remember why their goals matter. You DO NOT copy their text verbatim; you digest it and rephrase it in your own words. Stay motivating and future-focused; avoid insults, hate, or self-harm content.",
        },
        {
          role: "user",
          content:
            `Goal title: ${goalTitle}\n` +
            `Time window: ${timeWindow ?? "unspecified"}\n\n` +
            `User memo (raw text from the user about why this goal matters):\n` +
            `${baseText}\n\n` +
            `Write ${count} distinct, short push notification messages (max 140 characters each). ` +
            `Each should feel like an emotionally stimulating nudge from a caring accountability partner, referencing the user's own reasons. ` +
            `Respond with exactly ${count} lines, one message per line, no numbering or bullet points, and no additional commentary before or after.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    console.log("Reminder message error", await response.text());
    return [];
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content ?? "";

  // Expect one message per line; split and clean
  const lines = content
    .split("\n")
    .map((line) => line.trim().replace(/^[\d\-\.\)]\s*/, "")) // remove simple numbering/bullets
    .filter((line) => line.length > 0);

  if (lines.length > 0) {
    return lines.slice(0, count);
  }

  // Fallback: use generic AI-style templates that do NOT copy user text directly
  const templates = [
    `Future you is counting on today's you to move "${goalTitle}" forward.`,
    `Remember why "${goalTitle}" matters—take one small step right now.`,
    `You promised yourself you'd show up for "${goalTitle}". This is that moment.`,
    `Think about how it will feel when "${goalTitle}" is behind you, not ahead of you.`,
  ];

  const fallbackMessages: string[] = [];
  for (let i = 0; i < count; i += 1) {
    fallbackMessages.push(templates[i % templates.length]);
  }
  return fallbackMessages;
}


export async function generateQuickMemoTitleAndSummary(
  text: string,
): Promise<{ title: string | null; summary: string | null }> {
  const trimmed = text.trim();
  if (!trimmed) return { title: null, summary: null };

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
            "You're a smart behavioral coach. Given a memo, produce a concise, intelligible title (3–5 words, grammatically correct) and a paragraph summary that highlights behavioral patterns, insights, energy level, awareness, strengths or weaknesses to help the user understand their behavioral fingerprint and boost performance. Reply as JSON {\"title\": string, \"summary\": string}.",
        },
        {
          role: "user",
          content: trimmed,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    console.log("Quick memo title/summary error", await response.text());
    return { title: null, summary: null };
  }

  try {
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { title: null, summary: null };
    const parsed = JSON.parse(content) as { title?: string; summary?: string };
    return {
      title: parsed.title ?? null,
      summary: parsed.summary ?? null,
    };
  } catch (error) {
    console.log("Failed to parse quick memo title/summary", error);
    return { title: null, summary: null };
  }
}

export async function generateOptimizeInsights(input: {
  texts: string[];
  lens: string;
  windowLabel: string;
}): Promise<{ summary: string | null; bullets: string[] }> {
  const { texts, lens, windowLabel } = input;
  if (!texts.length) return { summary: null, bullets: [] };

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
            "You are an insight generator. Given user logs (reflections, focus blocks, quick memos) and a requested lens, produce a concise 150–200 word insight plus exactly 3 short bullet points. If data is insufficient, respond with {\"summary\": null, \"bullets\": []}. Respond as JSON: {\"summary\": string | null, \"bullets\": string[]}.",
        },
        {
          role: "user",
          content: [
            `Time window: ${windowLabel}`,
            `Lens: ${lens}`,
            "Logs:",
            texts.join("\n---\n"),
          ].join("\n"),
        },
      ],
      temperature: 0.4,
      max_tokens: 300,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    console.log("Optimize insights error", await response.text());
    return { summary: null, bullets: [] };
  }

  try {
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { summary: null, bullets: [] };
    const parsed = JSON.parse(content) as {
      summary?: string | null;
      bullets?: string[];
    };
    return {
      summary: parsed.summary ?? null,
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets.slice(0, 3) : [],
    };
  } catch (error) {
    console.log("Failed to parse optimize insights response", error);
    return { summary: null, bullets: [] };
  }
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
            "You You are Focusprint, an intelligent AI productivity partner. Your goal is to reflect on a user’s performance using concise, emotionally engaging summaries.",
        },
        {
          role: "user",
          content: [
            "You will receive one or more goals, each including:",
            "- goal title, due date, goal type, initial feeling, friction",
            "- why-summary or initial memo (voice transcript or text)",
            "- reflection data: emotion, satisfaction level, and reflection memo",
            "",
            "1) Your goal is to reflect on a user’s performance using concise, emotionally engaging summaries. You must dynamically adjust your response based on a randomly selected lens from the list below.",
            "   - Each summary must follow this 3-part format:",
            "       - Mirror (What happened): Reflect back a clear, short behavioral observation. No judgment. Just fact.",
            "       - Insight (Why it matters): Reveal one meaningful psychological or behavioral pattern based on the selected lens.",
            "       - Nudge (What’s next): Suggest a small, emotionally relevant action, framed as a question or affirmation.",
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
