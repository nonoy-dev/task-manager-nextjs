import { describe, expect, it } from "vitest";
import { apiFetch, login } from "./http";

describe("Rails API task CRUD (integration)", () => {
  it("logs in, creates, updates, and deletes a task", async () => {
    const title = `Integration CRUD ${Date.now()}`;

    const sessionRes = await login("demo@example.com", "password");
    expect(sessionRes.status).toBe(201);

    const createRes = await apiFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        task: {
          title,
          status: "todo",
          priority: "low",
        },
      }),
    });
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { id: number; title: string };
    expect(created.title).toBe(title);

    const updatedTitle = `${title} updated`;
    const patchRes = await apiFetch(`/api/tasks/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({ task: { title: updatedTitle } }),
    });
    expect(patchRes.status).toBe(200);
    const patched = (await patchRes.json()) as { title: string };
    expect(patched.title).toBe(updatedTitle);

    const showRes = await apiFetch(`/api/tasks/${created.id}`);
    expect(showRes.status).toBe(200);
    expect(((await showRes.json()) as { title: string }).title).toBe(
      updatedTitle,
    );

    const deleteRes = await apiFetch(`/api/tasks/${created.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    const missingRes = await apiFetch(`/api/tasks/${created.id}`);
    expect(missingRes.status).toBe(404);
  });
});
