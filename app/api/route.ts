function iteratorToStream(iterator: AsyncGenerator<Uint8Array, void, unknown>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

const encoder = new TextEncoder()

async function* makeIterator() {
  yield encoder.encode('<p>One</p>')
  await sleep(1000)
  yield encoder.encode('<p>Two</p>')
  await sleep(1000)
  yield encoder.encode('<p>Three</p>')
}

export async function POST() {
  const iterator = makeIterator()
  const stream = iteratorToStream(iterator)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}