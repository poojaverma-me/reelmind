import { recommend } from "@/lib/recommend";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { history?: unknown };
  const history = Array.isArray(body.history) ? body.history.filter((x): x is string => typeof x === "string").slice(0, 40) : [];
  if (history.length === 0) return Response.json({ error: "history is required" }, { status: 400 });
  return Response.json(await recommend(history));
}
