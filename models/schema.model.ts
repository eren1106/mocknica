import { Prisma } from "@prisma/client"

export type SchemaField = Prisma.SchemaFieldGetPayload<{
    include: { 
      objectType: true;
      arrayType: true;
    }
  }>