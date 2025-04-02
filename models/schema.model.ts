import { Prisma } from "@prisma/client"

export type Schema = Prisma.SchemaGetPayload<{
    include: { 
      fields: {
        include: {
          objectSchema: true;
          arrayType: {
            include: {
              objectSchema: true;
            }
          }
        }
      }
    }
  }>