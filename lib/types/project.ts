import { z } from "zod";

export const INVALID_PROJECT_DTO_MESSAGE = "Invalid project API response";

export const projectDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  user_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProjectDto = z.infer<typeof projectDtoSchema>;

const projectDtoListSchema = z.array(projectDtoSchema);

export type Project = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export function parseProjectDto(data: unknown): ProjectDto {
  const result = projectDtoSchema.safeParse(data);
  if (!result.success) {
    throw new Error(INVALID_PROJECT_DTO_MESSAGE);
  }
  return result.data;
}

export function parseProjectDtos(data: unknown): ProjectDto[] {
  const result = projectDtoListSchema.safeParse(data);
  if (!result.success) {
    throw new Error(INVALID_PROJECT_DTO_MESSAGE);
  }
  return result.data;
}

export function projectFromDto(dto: ProjectDto): Project {
  return {
    id: dto.id,
    name: dto.name,
    userId: dto.user_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function projectsFromDto(dtos: ProjectDto[]): Project[] {
  return dtos.map(projectFromDto);
}
