// app/api/endpoints/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Convert string JSON fields to actual JSON
    const endpoint = await prisma.endpoint.create({
      data: {
        ...data,
        staticResponse: data.staticResponse ? JSON.parse(data.staticResponse) : null,
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