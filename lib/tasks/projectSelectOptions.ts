export type ProjectSelectOption = {
  value: string;
  label: string;
};

type ProjectLike = {
  id: number;
  name: string;
};

export function projectSelectOptions(
  projects: readonly ProjectLike[],
): ProjectSelectOption[] {
  return [
    { value: "", label: "未分類" },
    ...projects.map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
  ];
}
