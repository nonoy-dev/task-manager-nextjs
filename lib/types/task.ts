import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

const taskDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z.string().nullable(),
  tags: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TaskDto = z.infer<typeof taskDtoSchema>;

const taskDtoListSchema = z.array(taskDtoSchema);

const taskListMetaSchema = z.object({
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

const taskListResponseSchema = z.object({
  tasks: taskDtoListSchema,
  meta: taskListMetaSchema,
});

export type TaskListMeta = z.infer<typeof taskListMetaSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;

export const INVALID_TASK_DTO_MESSAGE = "Invalid task API response";

export function parseTaskDto(data: unknown): TaskDto {
  const result = taskDtoSchema.safeParse(data);
  if (!result.success) {
    throw new Error(INVALID_TASK_DTO_MESSAGE);
  }
  return result.data;
}

export function parseTaskDtos(data: unknown): TaskDto[] {
  const result = taskDtoListSchema.safeParse(data);
  if (!result.success) {
    throw new Error(INVALID_TASK_DTO_MESSAGE);
  }
  return result.data;
}

export function parseTaskListResponse(data: unknown): TaskListResponse {
  const result = taskListResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error(INVALID_TASK_DTO_MESSAGE);
  }
  return result.data;
}

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
};

function parseTagList(raw: string | null): string[] {
  if (raw == null || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function taskFromDto(dto: TaskDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    dueDate: dto.due_date,
    tagList: parseTagList(dto.tags),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function tasksFromDto(dtos: TaskDto[]): Task[] {
  return dtos.map(taskFromDto);
}
