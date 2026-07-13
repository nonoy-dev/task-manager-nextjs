# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Tasks", type: :request do
  let!(:user) do
    User.create!(
      email: "tasks-spec@example.com",
      password: "password",
      password_confirmation: "password",
    )
  end

  def login_as(user)
    post api_sessions_path,
         params: { email: user.email, password: "password" },
         as: :json
  end

  describe "when not authenticated" do
    it "returns 401 for GET /api/tasks" do
      get api_tasks_path

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end

    it "returns 401 for POST /api/tasks" do
      post api_tasks_path,
           params: { task: { title: "Nope" } },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end
  end

  describe "when authenticated" do
    before { login_as(user) }

    describe "GET /api/tasks" do
      it "returns http success" do
        get api_tasks_path

        expect(response).to have_http_status(:ok)
      end

      it "returns tasks as JSON" do
        user.tasks.create!(title: "Alpha", status: :todo, priority: :low)

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
        user.tasks.create!(title: "Meeting prep", status: :todo, priority: :low)
        user.tasks.create!(title: "Other", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "meet" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Meeting prep")
      end

      it "filters by partial description match" do
        user.tasks.create!(title: "Doc A", description: "Ruby on Rails", status: :todo, priority: :low)
        user.tasks.create!(title: "Doc B", description: "Python only", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "rails" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Doc A")
      end

      it "returns all tasks when q is blank" do
        user.tasks.create!(title: "One", status: :todo, priority: :low)
        user.tasks.create!(title: "Two", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "   " }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.size).to eq(2)
      end

      it "filters by status when status param is present" do
        user.tasks.create!(title: "Todo A", status: :todo, priority: :low)
        user.tasks.create!(title: "Done B", status: :done, priority: :low)

        get api_tasks_path, params: { status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Todo A")
        expect(json.first["status"]).to eq("todo")
      end

      it "filters by priority when priority param is present" do
        user.tasks.create!(title: "Low P", status: :todo, priority: :low)
        user.tasks.create!(title: "High P", status: :todo, priority: :high)

        get api_tasks_path, params: { priority: "high" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("High P")
        expect(json.first["priority"]).to eq("high")
      end

      it "ignores invalid status param" do
        user.tasks.create!(title: "Todo A", status: :todo, priority: :low)
        user.tasks.create!(title: "Done B", status: :done, priority: :low)

        get api_tasks_path
        expect(response.parsed_body.size).to eq(2)

        get api_tasks_path, params: { status: "not_a_real_status" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.size).to eq(2)
      end

      it "combines q with status filter" do
        user.tasks.create!(title: "Alpha meeting", status: :todo, priority: :low)
        user.tasks.create!(title: "Beta meeting", status: :done, priority: :low)

        get api_tasks_path, params: { q: "meeting", status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Alpha meeting")
      end

      it "sorts by created_at ascending when requested" do
        older = user.tasks.create!(title: "Older", status: :todo, priority: :low)
        newer = user.tasks.create!(title: "Newer", status: :todo, priority: :low)
        older.update_column(:created_at, 2.days.ago)
        newer.update_column(:created_at, 1.day.ago)

        get api_tasks_path, params: { sort: "created_at", direction: "asc" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.map { |row| row["title"] }).to eq(%w[Older Newer])
      end

      it "sorts by due_date ascending when requested" do
        user.tasks.create!(
          title: "Later due",
          status: :todo,
          priority: :low,
          due_date: Time.zone.parse("2026-12-01"),
        )
        user.tasks.create!(
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
        first = user.tasks.create!(title: "First", status: :todo, priority: :low)
        second = user.tasks.create!(title: "Second", status: :todo, priority: :low)
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
        task = user.tasks.create!(title: "Show", status: :todo, priority: :medium)

        get api_task_path(task)

        expect(response).to have_http_status(:ok)
      end

      it "returns the task as JSON" do
        task = user.tasks.create!(title: "Beta", status: :in_progress, priority: :high)

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
        task = user.tasks.create!(title: "Delete me", status: :todo, priority: :low)

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
      it "returns 422 when the task has no user" do
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
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to include("User must exist")
      end

      it "returns 422 when title is blank" do
        expect {
          post api_tasks_path, params: { task: { title: "" } }, as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to include("Title can't be blank")
      end
    end

    describe "PATCH /api/tasks/:id" do
      it "updates the task status" do
        task = user.tasks.create!(title: "Patch target", status: :todo, priority: :medium)

        patch api_task_path(task), params: { task: { status: "done" } }, as: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["id"]).to eq(task.id)
        expect(json["status"]).to eq("done")
        expect(task.reload.status).to eq("done")
        expect_task_json_shape(json)
      end

      it "updates title and priority" do
        task = user.tasks.create!(title: "Before", status: :todo, priority: :low)

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
        task = user.tasks.create!(title: "Keep", status: :todo, priority: :low)

        patch api_task_path(task), params: { task: { title: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
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
end
