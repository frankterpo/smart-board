import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    // Use OpenAI to intelligently parse the voice transcript into tasks
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps users create organized task lists from voice transcripts.
          Your job is to analyze the transcript and extract actionable tasks with detailed descriptions.

          Guidelines:
          - Extract individual, actionable tasks from the transcript
          - Create brief but descriptive titles for each task (max 50 characters)
          - Generate detailed descriptions explaining what needs to be done (2-3 sentences)
          - Group related tasks together
          - Prioritize the most important tasks
          - Return tasks in order of priority/sequence
          - Include specific requirements, tools, or approaches needed
          - Make descriptions actionable and specific

          Return format: JSON array of objects with 'title', 'description', and 'priority' fields.`
        },
        {
          role: 'user',
          content: `Please analyze this voice transcript and create a task list: "${transcript}"`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let tasks = [];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing the whole response
        tasks = JSON.parse(response);
      }
    } catch (parseError) {
      // If JSON parsing fails, create a simple task from the transcript
      tasks = [{
        title: transcript.length > 50 ? transcript.substring(0, 47) + '...' : transcript,
        priority: 'medium'
      }];
    }

    // Ensure we have valid task objects
    const validTasks = tasks
      .filter((task: any) => task && typeof task === 'object' && task.title)
      .map((task: any, index: number) => ({
        title: task.title || `Task ${index + 1}`,
        priority: task.priority || 'medium',
        description: task.description || '',
        tags: task.tags || []
      }));

    // Store the voice transcript and processed tasks in Supabase
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('voice_transcripts').insert({
      transcript,
      processed_tasks: validTasks,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      tasks: validTasks,
      transcript,
      metadata: {
        processed_at: new Date().toISOString(),
        task_count: validTasks.length,
        model: 'gpt-4'
      }
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice transcript' },
      { status: 500 }
    );
  }
}
