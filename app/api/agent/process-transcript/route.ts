import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOrCreateCardAgent, addMemory, retrieveMemories } from '@/lib/card-agent';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, cardId } = await request.json();

    if (!transcript || !cardId) {
      return NextResponse.json({ error: 'Transcript and cardId are required' }, { status: 400 });
    }

    // Get or create card agent
    const agent = await getOrCreateCardAgent(cardId, 'Voice Task', transcript);

    // Get relevant memories for context
    const memories = await retrieveMemories(cardId, transcript);

    // Use OpenAI to intelligently parse the voice transcript into tasks
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an intelligent task creation agent. Analyze voice transcripts and create actionable tasks.

Your role:
- Extract individual, actionable tasks from voice transcripts
- Create brief but descriptive titles (max 50 characters)
- Generate detailed descriptions (2-3 sentences)
- Identify required tools and approaches
- Suggest ACI apps that might be helpful
- Group related tasks logically
- Prioritize tasks by importance/sequence

Context from previous interactions:
${memories.map(m => m.content).join('\n')}

Return format: JSON array of objects with 'title', 'description', 'priority', and 'suggestedApps' fields.`
        },
        {
          role: 'user',
          content: `Please analyze this voice transcript and create a task list: "${transcript}"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let tasks = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        tasks = JSON.parse(response);
      }
    } catch (parseError) {
      // If JSON parsing fails, create a simple task
      tasks = [{
        title: transcript.length > 50 ? transcript.substring(0, 47) + '...' : transcript,
        description: transcript,
        priority: 'medium',
        suggestedApps: []
      }];
    }

    // Ensure we have valid task objects
    const validTasks = tasks
      .filter((task: any) => task && typeof task === 'object' && task.title)
      .map((task: any, index: number) => ({
        title: task.title || `Task ${index + 1}`,
        priority: task.priority || 'medium',
        description: task.description || '',
        suggestedApps: task.suggestedApps || []
      }));

    // Store the processing result in memory
    await addMemory(cardId, `Created ${validTasks.length} tasks from voice transcript`, 'analysis', {
      tasks: validTasks,
      transcript: transcript.substring(0, 200) // Truncate for storage
    });

    return NextResponse.json({
      tasks: validTasks,
      transcript,
      agent: {
        id: agent.id,
        name: agent.name
      },
      metadata: {
        processed_at: new Date().toISOString(),
        task_count: validTasks.length,
        memories_used: memories.length
      }
    });

  } catch (error) {
    console.error('Transcript processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
