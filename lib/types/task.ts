export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskDto = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
};

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
