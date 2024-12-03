export const runtime = 'nodejs'
// This is required to enable streaming
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()
  let timer: NodeJS.Timeout | null = null

  request.signal.onabort = () => {
    if (timer) {
      clearInterval(timer)
    }
    console.log('closing writer')
    writer.close()
  }

  const lines = ['data: a', 'data: b', 'data: c', 'data: d', 'data: [DONE]']
  let i = 0
  timer = setInterval(() => {
    const line = lines[i]
    const message = line.replace(/^data: /, '')
    if (message === '[DONE]') {
      if (timer) {
        clearInterval(timer)
      }
      console.log('Stream completed')
      writer.close()
      return
    }
    try {
      writer.write(encoder.encode(`event: message\ndata: ${message}\n\n`))
    } catch (error) {
      console.error('Could not JSON parse stream message', message, error)
    }
    i++
  }, 1000)

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
