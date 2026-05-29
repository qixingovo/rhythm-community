const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  jsonMode?: boolean
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<Response> {
  const {
    model = "deepseek-chat",
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
    jsonMode = false,
  } = options

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  }

  if (jsonMode) {
    body.response_format = { type: "json_object" }
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`DeepSeek API error ${response.status}: ${errorText}`)
  }

  return response
}
