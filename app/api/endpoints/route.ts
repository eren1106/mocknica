// app/api/endpoints/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const endpointSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  path: z.string(),
  parameters: z.string().optional(),
  requestBody: z.string().optional(),
  response: z.string(),
  responseGen: z.enum(["STATIC", "LLM"]),
  staticResponse: z.string().optional(),
  arrayQuantity: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = endpointSchema.parse(body);

    // Convert string JSON fields to actual JSON
    const endpoint = await prisma.endpoint.create({
      data: {
        ...validatedData,
        parameters: validatedData.parameters ? JSON.parse(validatedData.parameters) : null,
        requestBody: validatedData.requestBody ? JSON.parse(validatedData.requestBody) : null,
        staticResponse: validatedData.staticResponse ? JSON.parse(validatedData.staticResponse) : null,
      },
    });

    return NextResponse.json(endpoint);
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const endpoints = await prisma.endpoint.findMany();
    return NextResponse.json(endpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 });
  }
}