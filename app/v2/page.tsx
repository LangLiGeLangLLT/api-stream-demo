'use client'

import { Button } from '@/components/ui/button'
import React from 'react'

export default function Page() {
  const [html, setHtml] = React.useState('')

  async function onRun() {
    const res = await fetch('/api/v2', {
      method: 'POST',
    })

    if (!res.body) return

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        setHtml((html) => html + value)
      }
    } finally {
      reader.releaseLock()
    }
  }

  function onStop() {}

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
