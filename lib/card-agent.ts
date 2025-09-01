import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CardAgent {
  id: string;
  cardId: string;
  name: string;
  personality: string;
  capabilities: string[];
  memory: CardMemory[];
}

export interface CardMemory {
  id: string;
  content: string;
  contentType: 'voice_transcript' | 'chat_message' | 'app_config' | 'task_execution' | 'analysis';
  metadata: Record<string, any>;
  createdAt: string;
  embedding?: number[];
}

// Voice transcription agent
export async function transcribeVoice(audioBlob: Blob): Promise<string> {
  try {
    // For now, using Web Speech API simulation
    // In production, this would use ElevenLabs or similar
    const formData = new FormData();
    formData.append('audio', audioBlob);

    // Mock transcription for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Create a task to analyze market trends and generate a report");
      }, 1000);
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    throw error;
  }
}

// Create or get card agent
export async function getOrCreateCardAgent(cardId: string, title: string, description?: string): Promise<CardAgent> {
  // Check if agent exists
  const { data: existing } = await supabase
    .from('card_agents')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (existing) {
    return {
      id: existing.id,
      cardId: existing.card_id,
      name: existing.agent_name,
      personality: existing.personality,
      capabilities: existing.capabilities || [],
      memory: []
    };
  }

  // Create new agent
  const agentName = `Agent-${cardId.slice(-4)}`;
  const personality = `You are ${agentName}, an intelligent task assistant specializing in ${title}. You help users create, configure, and execute tasks effectively.`;

  const capabilities = [
    'task_analysis',
    'aci_app_configuration',
    'tool_execution',
    'memory_management',
    'user_interaction'
  ];

  const { data, error } = await supabase
    .from('card_agents')
    .insert({
      card_id: cardId,
      agent_name: agentName,
      description: `AI agent for card: ${title}`,
      intent: `${title} ${description || ''}`.trim(),
      personality,
      capabilities
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    cardId: data.card_id,
    name: data.agent_name,
    personality: data.personality,
    capabilities: data.capabilities || [],
    memory: []
  };
}

// Add memory to card agent
export async function addMemory(
  cardId: string,
  content: string,
  contentType: CardMemory['contentType'],
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(content);

    await supabase.from('card_memory').insert({
      card_id: cardId,
      content,
      content_type: contentType,
      metadata,
      embedding
    });
  } catch (error) {
    console.error('Failed to add memory:', error);
    // Fallback: add without embedding
    await supabase.from('card_memory').insert({
      card_id: cardId,
      content,
      content_type: contentType,
      metadata
    });
  }
}

// Generate OpenAI embedding
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

// Retrieve relevant memories
export async function retrieveMemories(cardId: string, query: string, limit: number = 5): Promise<CardMemory[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('similar_memories', {
      card_id_param: cardId,
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    // Fallback: get recent memories
    const { data } = await supabase
      .from('card_memory')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }
}

// ACI App Configuration Agent
export async function configureACIApp(
  cardId: string,
  appName: string,
  userInstructions: string
): Promise<{ success: boolean; configuration: any; message: string }> {
  try {
    // Get agent memory for context
    const memories = await retrieveMemories(cardId, `configure ${appName} app`);

    const systemPrompt = `You are an ACI app configuration specialist. Help users configure ${appName} for their tasks.

Based on the user's request: "${userInstructions}"

Available context from previous interactions:
${memories.map(m => m.content).join('\n')}

Guide the user through:
1. What API keys/credentials they need
2. How to obtain them
3. How to configure the app securely
4. Testing the configuration

Be helpful, secure, and clear about requirements.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInstructions }
      ],
      temperature: 0.7
    });

    const message = response.choices[0]?.message?.content || 'Configuration guidance generated.';

    // Store in memory
    await addMemory(cardId, `Configured ${appName}: ${message}`, 'app_config', {
      appName,
      configuration: 'pending'
    });

    return {
      success: true,
      configuration: { appName, status: 'configured' },
      message
    };
  } catch (error) {
    console.error('ACI app configuration failed:', error);
    return {
      success: false,
      configuration: null,
      message: 'Failed to configure ACI app. Please try again.'
    };
  }
}

// Task Execution Agent
export async function executeTask(
  cardId: string,
  taskDescription: string,
  availableApps: string[]
): Promise<{ success: boolean; result: any; message: string }> {
  try {
    // Get relevant memories
    const memories = await retrieveMemories(cardId, taskDescription);

    const systemPrompt = `You are a task execution agent. Execute the user's task using available tools and apps.

Task: ${taskDescription}

Available Apps: ${availableApps.join(', ')}

Context from memory:
${memories.map(m => m.content).join('\n')}

Execute the task step by step, using the most appropriate tools available.
Provide clear results and explanations of what was accomplished.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: taskDescription }
      ],
      temperature: 0.3
    });

    const result = response.choices[0]?.message?.content || 'Task executed successfully.';

    // Store execution in memory
    await addMemory(cardId, `Executed task: ${taskDescription}\nResult: ${result}`, 'task_execution', {
      taskDescription,
      result: result.substring(0, 500) // Truncate for storage
    });

    return {
      success: true,
      result,
      message: result
    };
  } catch (error) {
    console.error('Task execution failed:', error);
    return {
      success: false,
      result: null,
      message: 'Task execution failed. Please check your configuration and try again.'
    };
  }
}

// Chat Agent
export async function chatWithAgent(
  cardId: string,
  userMessage: string,
  conversationHistory: any[] = []
): Promise<{ response: string; suggestedActions?: any[] }> {
  try {
    // Get relevant memories
    const memories = await retrieveMemories(cardId, userMessage);

    const systemPrompt = `You are a helpful AI assistant for task management. Help users with their tasks, suggest improvements, and guide them through configurations.

Card Memory Context:
${memories.map(m => m.content).join('\n')}

Be proactive in:
- Suggesting task improvements
- Helping with app configurations
- Providing guidance on next steps
- Remembering previous interactions

Always be helpful, clear, and action-oriented.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // Last 5 messages
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || 'I understand. How can I help you further?';

    // Store chat in memory
    await addMemory(cardId, `User: ${userMessage}\nAgent: ${aiResponse}`, 'chat_message', {
      userMessage,
      aiResponse
    });

    return {
      response: aiResponse,
      suggestedActions: [] // Could include suggested next steps
    };
  } catch (error) {
    console.error('Chat failed:', error);
    return {
      response: 'I encountered an error processing your message. Please try again.',
      suggestedActions: []
    };
  }
}
