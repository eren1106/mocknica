import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const endpoint = await prisma.endpoint.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(endpoint);
  } catch (error) {
    console.error('Error updating endpoint:', error);
    return NextResponse.json({ error: 'Failed to update endpoint' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.endpoint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return NextResponse.json({ error: 'Failed to delete endpoint' }, { status: 500 });
  }
}
