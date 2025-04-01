import { Prisma } from "@prisma/client"

export type Schema = Prisma.SchemaGetPayload<{
    include: { 
      fields: true;
    }
  }>