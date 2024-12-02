'use client'

import { Button } from '@/components/ui/button'
import React from 'react'

export default function Home() {
  const [html, setHtml] = React.useState('')
  const readerRef = React.useRef<ReadableStreamDefaultReader<string>>()

  async function onRun() {
    const res = await fetch('http://localhost:3000/api', {
      method: 'POST',
    })

    if (!res.body) return

    try {
      readerRef.current = res.body
        .pipeThrough(new TextDecoderStream())
        .getReader()
      while (true) {
        const { value, done } = await readerRef.current.read()
        if (done) break
        setHtml((html) => html + value)
      }
    } finally {
      readerRef.current?.releaseLock()
      readerRef.current = undefined
    }
  }

  function onStop() {
    try {
      readerRef.current?.cancel()
    } finally {
      readerRef.current?.releaseLock()
      readerRef.current = undefined
    }
  }

  return (
    <>
      <Button onClick={onRun}>Run</Button>
      <Button onClick={onStop} variant="destructive">
        Stop
      </Button>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
