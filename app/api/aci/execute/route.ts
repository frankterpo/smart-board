import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { executeFunction, getFunctionDefinition } from '@/lib/aci';

export async function POST(request: NextRequest) {
  try {
    const { cardId, functionName, functionArguments, linkedAccountOwnerId } = await request.json();

    if (!cardId || !functionName) {
      return NextResponse.json({
        error: 'cardId and functionName are required'
      }, { status: 400 });
    }

    const ownerId = linkedAccountOwnerId || `user-${cardId}`;
    const startTime = Date.now();

    try {
      // Execute the function
      const result = await executeFunction(functionName, functionArguments, ownerId);
      const executionTime = Date.now() - startTime;

      // Log the execution
      await supabase.from('aci_function_executions').insert({
        card_id: cardId,
        function_name: functionName,
        app_name: functionName.split('__')[0],
        arguments: functionArguments,
        result: result,
        success: result.success,
        error_message: result.success ? null : result.error,
        execution_time_ms: executionTime
      });

      return NextResponse.json({
        success: result.success,
        data: result.data,
        error: result.error,
        executionTime
      });

    } catch (executionError) {
      const executionTime = Date.now() - startTime;

      // Log failed execution
      await supabase.from('aci_function_executions').insert({
        card_id: cardId,
        function_name: functionName,
        app_name: functionName.split('__')[0],
        arguments: functionArguments,
        success: false,
        error_message: executionError.message,
        execution_time_ms: executionTime
      });

      throw executionError;
    }

  } catch (error) {
    console.error('Failed to execute ACI function:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET - Get function definition
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const functionName = searchParams.get('functionName');

    if (!functionName) {
      return NextResponse.json({ error: 'functionName is required' }, { status: 400 });
    }

    const definition = await getFunctionDefinition(functionName);
    return NextResponse.json({ definition });

  } catch (error) {
    console.error('Failed to get function definition:', error);
    return NextResponse.json({ error: 'Failed to get definition' }, { status: 500 });
  }
}
