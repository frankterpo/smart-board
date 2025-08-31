import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { cardId, title, description, availableTools } = await request.json();

    const analysisPrompt = `You are a task optimization AI assistant. Analyze this task card and suggest improvements to make it more effective and executable.

Task Details:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Available Tools: ${availableTools?.join(', ') || 'None'}

Your task is to:
1. Analyze the current task for clarity, specificity, and executability
2. Suggest improvements to the title (make it more actionable and specific)
3. Suggest improvements to the description (add more context, steps, or requirements)
4. Identify which tools would be most helpful for this task
5. Provide reasoning for your suggestions

Return your response as JSON with this structure:
{
  "analysis": "Your detailed analysis and suggestions in natural language",
  "suggestedChanges": {
    "title": "improved title (or null if no change needed)",
    "description": "improved description (or null if no change needed)",
    "tools": ["array", "of", "recommended", "tools"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a task optimization expert. Provide clear, actionable suggestions in JSON format.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '{}';

    // Try to parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      analysisData = {
        analysis: response,
        suggestedChanges: {
          title: null,
          description: null,
          tools: []
        }
      };
    }

    return NextResponse.json({
      analysis: analysisData.analysis || response,
      suggestedChanges: analysisData.suggestedChanges || {}
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      {
        analysis: 'I encountered an error while analyzing your task. Please try again.',
        suggestedChanges: {}
      },
      { status: 500 }
    );
  }
}
