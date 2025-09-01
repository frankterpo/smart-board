import { NextRequest, NextResponse } from 'next/server';
import { addMemory } from '@/lib/card-agent';

export async function POST(request: NextRequest) {
  try {
    const { transcript, cardId } = await request.json();

    if (!transcript || !cardId) {
      return NextResponse.json({ error: 'Transcript and cardId are required' }, { status: 400 });
    }

    // Store transcript in card memory
    await addMemory(cardId, transcript, 'voice_transcript', {
      rawTranscript: transcript,
      processingStatus: 'analyzing'
    });

    // Use card agent to process the transcript
    const agentResponse = await fetch('http://localhost:3000/api/agent/process-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, cardId })
    });

    const result = await agentResponse.json();

    if (!agentResponse.ok) {
      throw new Error(result.error || 'Failed to process transcript');
    }

    // Update memory with processing results
    await addMemory(cardId, `Processed voice transcript into ${result.tasks?.length || 0} tasks`, 'analysis', {
      tasksGenerated: result.tasks?.length || 0,
      processingComplete: true
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice transcript' },
      { status: 500 }
    );
  }
}
