import { Prisma } from "@prisma/client";

export type Project = Prisma.ProjectGetPayload<{
  include: {
    user: true;
    endpoints: true;
    schemas: true;
    responseWrappers: true;
  };
}>;
