# frozen_string_literal: true

require "rails_helper"

# Request specs: https://rspec.info/features/7-1/rspec-rails/request-specs/request-spec/
RSpec.describe "Api::Tasks", type: :request do
  describe "GET /api/tasks" do
    it "returns http success" do
      get api_tasks_path

      expect(response).to have_http_status(:ok)
    end

    it "returns tasks as JSON" do
      Task.create!(title: "Alpha", status: :todo, priority: :low)

      get api_tasks_path

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to be_a(Array)
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Alpha")
      expect(json.first["status"]).to eq("todo")
      expect_task_json_shape(json.first)
    end

    it "filters by partial title match case-insensitively" do
      Task.create!(title: "Meeting prep", status: :todo, priority: :low)
      Task.create!(title: "Other", status: :todo, priority: :low)

      get api_tasks_path, params: { q: "meet" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Meeting prep")
    end

    it "filters by partial description match" do
      Task.create!(title: "Doc A", description: "Ruby on Rails", status: :todo, priority: :low)
      Task.create!(title: "Doc B", description: "Python only", status: :todo, priority: :low)

      get api_tasks_path, params: { q: "rails" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Doc A")
    end

    it "returns all tasks when q is blank" do
      Task.create!(title: "One", status: :todo, priority: :low)
      Task.create!(title: "Two", status: :todo, priority: :low)

      get api_tasks_path, params: { q: "   " }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(2)
    end

    it "filters by status when status param is present" do
      Task.create!(title: "Todo A", status: :todo, priority: :low)
      Task.create!(title: "Done B", status: :done, priority: :low)

      get api_tasks_path, params: { status: "todo" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Todo A")
      expect(json.first["status"]).to eq("todo")
    end

    it "filters by priority when priority param is present" do
      Task.create!(title: "Low P", status: :todo, priority: :low)
      Task.create!(title: "High P", status: :todo, priority: :high)

      get api_tasks_path, params: { priority: "high" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("High P")
      expect(json.first["priority"]).to eq("high")
    end

    it "ignores invalid status param" do
      Task.create!(title: "Todo A", status: :todo, priority: :low)
      Task.create!(title: "Done B", status: :done, priority: :low)

      get api_tasks_path
      expect(response.parsed_body.size).to eq(2)

      get api_tasks_path, params: { status: "not_a_real_status" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.size).to eq(2)
    end

    it "combines q with status filter" do
      Task.create!(title: "Alpha meeting", status: :todo, priority: :low)
      Task.create!(title: "Beta meeting", status: :done, priority: :low)

      get api_tasks_path, params: { q: "meeting", status: "todo" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Alpha meeting")
    end

    it "sorts by created_at ascending when requested" do
      older = Task.create!(title: "Older", status: :todo, priority: :low)
      newer = Task.create!(title: "Newer", status: :todo, priority: :low)
      older.update_column(:created_at, 2.days.ago)
      newer.update_column(:created_at, 1.day.ago)

      get api_tasks_path, params: { sort: "created_at", direction: "asc" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.map { |row| row["title"] }).to eq(%w[Older Newer])
    end

    it "sorts by due_date ascending when requested" do
      Task.create!(
        title: "Later due",
        status: :todo,
        priority: :low,
        due_date: Time.zone.parse("2026-12-01"),
      )
      Task.create!(
        title: "Sooner due",
        status: :todo,
        priority: :low,
        due_date: Time.zone.parse("2026-06-01"),
      )

      get api_tasks_path, params: { sort: "due_date", direction: "asc" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.map { |row| row["title"] }).to eq(["Sooner due", "Later due"])
    end

    it "defaults invalid sort key to created_at ordering" do
      first = Task.create!(title: "First", status: :todo, priority: :low)
      second = Task.create!(title: "Second", status: :todo, priority: :low)
      first.update_column(:created_at, 2.days.ago)
      second.update_column(:created_at, 1.day.ago)

      get api_tasks_path, params: { sort: "not_a_column", direction: "asc" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json.map { |row| row["title"] }).to eq(%w[First Second])
    end
  end

  describe "GET /api/tasks/:id" do
    it "returns http success" do
      task = Task.create!(title: "Show", status: :todo, priority: :medium)

      get api_task_path(task)

      expect(response).to have_http_status(:ok)
    end

    it "returns the task as JSON" do
      task = Task.create!(title: "Beta", status: :in_progress, priority: :high)

      get api_task_path(task)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["id"]).to eq(task.id)
      expect(json["title"]).to eq("Beta")
      expect(json["status"]).to eq("in_progress")
    end

    it "returns not found when the task does not exist" do
      get api_task_path(999_999)

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Task not found")
    end
  end

  describe "DELETE /api/tasks/:id" do
    it "destroys the task" do
      task = Task.create!(title: "Delete me", status: :todo, priority: :low)

      expect {
        delete api_task_path(task)
      }.to change(Task, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found when task does not exist" do
      delete api_task_path(999_999)

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Task not found")
    end
  end

  describe "POST /api/tasks" do
    it "creates a task and returns 201 with JSON" do
      expect {
        post api_tasks_path,
             params: {
               task: {
                 title: "New from API",
                 description: "Details",
                 status: "todo",
                 priority: "medium",
               },
             },
             as: :json
      }.to change(Task, :count).by(1)

      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect_task_json_shape(json)
      expect(json["title"]).to eq("New from API")
      expect(json["description"]).to eq("Details")
      expect(json["status"]).to eq("todo")
      expect(json["priority"]).to eq("medium")
    end

    it "returns 422 when title is blank" do
      expect {
        post api_tasks_path, params: { task: { title: "" } }, as: :json
      }.not_to change(Task, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to include("Title can't be blank")
    end
  end

  describe "PATCH /api/tasks/:id" do
    it "updates the task status" do
      task = Task.create!(title: "Patch target", status: :todo, priority: :medium)

      patch api_task_path(task), params: { task: { status: "done" } }, as: :json

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["id"]).to eq(task.id)
      expect(json["status"]).to eq("done")
      expect(task.reload.status).to eq("done")
      expect_task_json_shape(json)
    end

    it "updates title and priority" do
      task = Task.create!(title: "Before", status: :todo, priority: :low)

      patch api_task_path(task),
            params: { task: { title: "After", priority: "high" } },
            as: :json

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["title"]).to eq("After")
      expect(json["priority"]).to eq("high")
      expect(task.reload.title).to eq("After")
      expect(task.priority).to eq("high")
    end

    it "returns 422 when update is invalid" do
      task = Task.create!(title: "Keep", status: :todo, priority: :low)

      patch api_task_path(task), params: { task: { title: "" } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to include("Title can't be blank")
      expect(task.reload.title).to eq("Keep")
    end

    it "returns not found when task does not exist" do
      patch api_task_path(999_999), params: { task: { status: "done" } }, as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Task not found")
    end
  end
end
