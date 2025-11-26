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
            "You summarize goal-intention memos in one short, encouraging sentence.",
        },
        {
          role: "user",
          content: `Summarize this in one short, encouraging sentence:\n\n${text}`,
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

