export default async function Home() {
  const res = await fetch("http://localhost:3000/api/tasks", {
    cache: "no-store",
  });
  const tasks = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Task Manager</h1>
      <p className="mt-4 text-lg">Tasks: {tasks.length}</p>
    </main>
  );
}
