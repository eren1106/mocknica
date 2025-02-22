// app/api/mock/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Ollama } from 'ollama';

const prisma = new PrismaClient();
const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params, 'PUT');
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params, 'DELETE');
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params, 'PATCH');
}

async function handleRequest(req: NextRequest, params: { path: string[] }, method: string) {
  try {
    const path = '/' + params.path.join('/');
    
    // Find matching endpoint
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        path,
        method,
      },
    });

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    // Generate response
    let response: any;
    if (endpoint.responseGen === 'STATIC') {
      response = endpoint.staticResponse;
    } else {
      // Use Ollama to generate response
      const prompt = `Generate a valid JSON response for this TypeScript type:\n${endpoint.response}\n\nMake sure the response is realistic and follows the schema exactly.`;
      
      const completion = await ollama.generate({
        model: 'deepseek',
        prompt,
      });

      response = JSON.parse(completion.response);
    }

    // Handle array responses
    if (Array.isArray(response) && endpoint.arrayQuantity) {
      response = Array(endpoint.arrayQuantity).fill(null).map(() => ({
        ...response[0],
        id: Math.floor(Math.random() * 1000) // Ensure unique IDs
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error handling mock request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}