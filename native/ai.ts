const AI_URL = process.env.EXPO_PUBLIC_BUZNEET_AI_URL;

export async function askBuzNeet(prompt: string, context?: { subject?: string; chapter?: string; question?: string }) {
  if (!AI_URL) throw new Error("AI gateway is not configured.");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      context,
      app: "BuzNeet",
      mode: "neet-tutor",
    }),
  });
  if (!res.ok) throw new Error("AI service is unavailable right now.");
  const data = await res.json();
  return String(data.answer ?? data.output ?? "No answer returned.");
}
