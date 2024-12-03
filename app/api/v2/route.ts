export const runtime = 'nodejs'
// This is required to enable streaming
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  request.signal.onabort = () => {
    console.log('closing writer')
    writer.close()
  }

  const lines = ['data: a', 'data: b', 'data: c', 'data: d', 'data: [DONE]']
  for (const line of lines) {
    const message = line.replace(/^data: /, '')
    if (message === '[DONE]') {
      console.log('Stream completed')
      writer.close()
      break
    }
    try {
      await sleep(500)
      writer.write(encoder.encode(`event: message\ndata: ${message}\n\n`))
    } catch (error) {
      console.error('Could not JSON parse stream message', message, error)
    }
  }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
