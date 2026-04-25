import { NextResponse } from 'next/server'
import { getCurrentCreator } from '@/lib/auth'

export const runtime = 'nodejs'

type PolishKind = 'narrativeHook' | 'chapterLore'

type Body = {
  kind: PolishKind
  text: string
  context?: Record<string, unknown>
}

const SYSTEM_PROMPT = `You are a copy editor for SerendiGO, a gamified travel guide to Sri Lanka.
Your job is to polish creator-written prose so it matches house tone:
- Warm but grounded. Curious, not breathless.
- Favour concrete sensory detail over adjectives.
- British English. Oxford comma optional.
- Never invent facts. If the input names a person, place, or dish, keep those names exact.
- Keep roughly the same length. Never more than 1.3x longer.
- Output ONLY the rewritten text. No preamble, no quotes, no commentary.`

function userPrompt(body: Body): string {
  const ctx = body.context ? `\n\nContext (for your reference only, do not quote):\n${JSON.stringify(body.context, null, 2)}` : ''
  if (body.kind === 'narrativeHook') {
    return `Polish this narrative hook that opens a travel story arc. Keep it to 2-3 sentences, evocative, written to make a traveller want to start.${ctx}\n\n---\n${body.text}`
  }
  return `Polish this chapter lore. It's the story fragment revealed after a traveller visits a location. 3-5 sentences, rich sensory detail, earn the visit.${ctx}\n\n---\n${body.text}`
}

export async function POST(req: Request) {
  const creator = await getCurrentCreator()
  if (!creator || creator.status !== 'approved') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI polish is not configured on this server. Add ANTHROPIC_API_KEY.' },
      { status: 503 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.kind || !body.text?.trim()) {
    return NextResponse.json({ error: 'Missing kind or text' }, { status: 400 })
  }
  if (body.text.length > 4000) {
    return NextResponse.json({ error: 'Text is too long — polish 4000 characters at a time.' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt(body) }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[polish] Anthropic error', res.status, errText)
      return NextResponse.json(
        { error: `AI service returned ${res.status}`, detail: errText.slice(0, 500) },
        { status: 502 },
      )
    }
    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>
    }
    const out = json.content?.find((b) => b.type === 'text')?.text?.trim()
    if (!out) return NextResponse.json({ error: 'No polished text returned' }, { status: 502 })
    return NextResponse.json({ text: out })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Polish failed' },
      { status: 500 },
    )
  }
}
