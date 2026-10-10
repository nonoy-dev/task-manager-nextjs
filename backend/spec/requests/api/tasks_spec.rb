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
    post api_session_path,
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
        expect(json).to be_a(Hash)
        expect(json["tasks"]).to be_a(Array)
        expect(json["tasks"].size).to eq(1)
        expect(json["tasks"].first["title"]).to eq("Alpha")
        expect(json["tasks"].first["status"]).to eq("todo")
        expect_task_json_shape(json["tasks"].first)
        expect(json["meta"]).to eq(
          "page" => 1,
          "per_page" => 20,
          "total" => 1,
          "total_pages" => 1,
        )
      end

      it "does not include other users tasks" do
        other = User.create!(
          email: "other-tasks@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other.tasks.create!(title: "Other user task", status: :todo, priority: :low)
        user.tasks.create!(title: "Mine", status: :todo, priority: :low)

        get api_tasks_path

        expect(response).to have_http_status(:ok)
        titles = response.parsed_body["tasks"].map { |task| task["title"] }
        expect(titles).to eq(["Mine"])
      end

      it "filters by partial title match case-insensitively" do
        user.tasks.create!(title: "Meeting prep", status: :todo, priority: :low)
        user.tasks.create!(title: "Other", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "meet" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Meeting prep")
      end

      it "filters by partial description match" do
        user.tasks.create!(title: "Doc A", description: "Ruby on Rails", status: :todo, priority: :low)
        user.tasks.create!(title: "Doc B", description: "Python only", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "rails" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Doc A")
      end

      it "returns all tasks when q is blank" do
        user.tasks.create!(title: "One", status: :todo, priority: :low)
        user.tasks.create!(title: "Two", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "   " }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "filters by status when status param is present" do
        user.tasks.create!(title: "Todo A", status: :todo, priority: :low)
        user.tasks.create!(title: "Done B", status: :done, priority: :low)

        get api_tasks_path, params: { status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Todo A")
        expect(json.first["status"]).to eq("todo")
      end

      it "filters by priority when priority param is present" do
        user.tasks.create!(title: "Low P", status: :todo, priority: :low)
        user.tasks.create!(title: "High P", status: :todo, priority: :high)

        get api_tasks_path, params: { priority: "high" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("High P")
        expect(json.first["priority"]).to eq("high")
      end

      it "ignores invalid status param" do
        user.tasks.create!(title: "Todo A", status: :todo, priority: :low)
        user.tasks.create!(title: "Done B", status: :done, priority: :low)

        get api_tasks_path
        expect(response.parsed_body["tasks"].size).to eq(2)

        get api_tasks_path, params: { status: "not_a_real_status" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "combines q with status filter" do
        user.tasks.create!(title: "Alpha meeting", status: :todo, priority: :low)
        user.tasks.create!(title: "Beta meeting", status: :done, priority: :low)

        get api_tasks_path, params: { q: "meeting", status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
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
        json = response.parsed_body["tasks"]
        expect(json.map { |row| row["title"] }).to eq(%w[Older Newer])
      end

      it "sorts by due_date ascending when requested" do
        user.tasks.create!(
          title: "Later due",
          status: :todo,
          priority: :low,
          due_date: Date.new(2026, 12, 1),
        )
        user.tasks.create!(
          title: "Sooner due",
          status: :todo,
          priority: :low,
          due_date: Date.new(2026, 6, 1),
        )

        get api_tasks_path, params: { sort: "due_date", direction: "asc" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.map { |row| row["title"] }).to eq(["Sooner due", "Later due"])
      end

      it "defaults invalid sort key to created_at ordering" do
        first = user.tasks.create!(title: "First", status: :todo, priority: :low)
        second = user.tasks.create!(title: "Second", status: :todo, priority: :low)
        first.update_column(:created_at, 2.days.ago)
        second.update_column(:created_at, 1.day.ago)

        get api_tasks_path, params: { sort: "not_a_column", direction: "asc" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.map { |row| row["title"] }).to eq(%w[First Second])
      end

      describe "pagination" do
        def create_ordered_tasks(count)
          count.times do |i|
            task = user.tasks.create!(
              title: format("Task %02d", i + 1),
              status: :todo,
              priority: :low,
            )
            task.update_column(:created_at, (count - i).minutes.ago)
          end
        end

        it "returns the second page of tasks" do
          create_ordered_tasks(21)

          get api_tasks_path, params: { page: 2, sort: "created_at", direction: "asc" }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"].map { |row| row["title"] }).to eq(["Task 21"])
          expect(json["meta"]).to eq(
            "page" => 2,
            "per_page" => 20,
            "total" => 21,
            "total_pages" => 2,
          )
        end

        it "returns the final partial page" do
          create_ordered_tasks(25)

          get api_tasks_path, params: { page: 2, sort: "created_at", direction: "asc" }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"].map { |row| row["title"] }).to eq(
            ["Task 21", "Task 22", "Task 23", "Task 24", "Task 25"],
          )
          expect(json["meta"]).to eq(
            "page" => 2,
            "per_page" => 20,
            "total" => 25,
            "total_pages" => 2,
          )
        end

        it "returns an empty tasks array when page is beyond the last page" do
          create_ordered_tasks(21)

          get api_tasks_path, params: { page: 99, sort: "created_at", direction: "asc" }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"]).to eq([])
          expect(json["meta"]).to eq(
            "page" => 99,
            "per_page" => 20,
            "total" => 21,
            "total_pages" => 2,
          )
        end

        it "normalizes invalid page values to page 1" do
          create_ordered_tasks(21)

          get api_tasks_path, params: { page: 0, sort: "created_at", direction: "asc" }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"].size).to eq(20)
          expect(json["tasks"].first["title"]).to eq("Task 01")
          expect(json["meta"]).to include("page" => 1, "total" => 21, "total_pages" => 2)

          get api_tasks_path, params: { page: "abc", sort: "created_at", direction: "asc" }

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body["meta"]["page"]).to eq(1)
          expect(response.parsed_body["tasks"].first["title"]).to eq("Task 01")
        end

        it "returns zero total_pages when there are no tasks" do
          get api_tasks_path

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"]).to eq([])
          expect(json["meta"]).to eq(
            "page" => 1,
            "per_page" => 20,
            "total" => 0,
            "total_pages" => 0,
          )
        end

        it "paginates after filters so meta total reflects the filtered scope" do
          create_ordered_tasks(5)
          3.times do |i|
            task = user.tasks.create!(
              title: format("Done %02d", i + 1),
              status: :done,
              priority: :low,
            )
            task.update_column(:created_at, (3 - i).minutes.ago)
          end

          get api_tasks_path, params: {
            status: "done",
            page: 1,
            sort: "created_at",
            direction: "asc",
          }

          expect(response).to have_http_status(:ok)
          json = response.parsed_body
          expect(json["tasks"].map { |row| row["title"] }).to eq(
            ["Done 01", "Done 02", "Done 03"],
          )
          expect(json["meta"]).to eq(
            "page" => 1,
            "per_page" => 20,
            "total" => 3,
            "total_pages" => 1,
          )
        end
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

      it "returns not found when the task belongs to another user" do
        other = User.create!(
          email: "other-show@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other_task = other.tasks.create!(title: "Other show", status: :todo, priority: :low)

        get api_task_path(other_task)

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

      it "returns not found when the task belongs to another user" do
        other = User.create!(
          email: "other-destroy@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other_task = other.tasks.create!(title: "Other delete", status: :todo, priority: :low)

        expect {
          delete api_task_path(other_task)
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body["error"]).to eq("Task not found")
      end
    end

    describe "POST /api/tasks" do
      it "creates a task for the current user" do
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
        }.to change { user.tasks.count }.by(1)

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json["title"]).to eq("New from API")
        expect(json["status"]).to eq("todo")
        expect(json["priority"]).to eq("medium")
        expect(user.tasks.find(json["id"]).user_id).to eq(user.id)
        expect_task_json_shape(json)
      end

      it "returns due_date as a calendar date string" do
        post api_tasks_path,
             params: {
               task: {
                 title: "Has due date",
                 status: "todo",
                 priority: "low",
                 due_date: "2026-12-01",
               },
             },
             as: :json

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json["due_date"]).to eq("2026-12-01")
        expect(user.tasks.find(json["id"]).due_date).to eq(Date.new(2026, 12, 1))
      end

      it "does not assign the task to another user when user_id is sent" do
        other = User.create!(
          email: "other-create@example.com",
          password: "password",
          password_confirmation: "password",
        )

        post api_tasks_path,
             params: {
               task: {
                 title: "Scoped create",
                 user_id: other.id,
               },
             },
             as: :json

        expect(response).to have_http_status(:created)
        created = user.tasks.find(response.parsed_body["id"])
        expect(created.user_id).to eq(user.id)
        expect(other.tasks).to be_empty
      end

      it "returns 422 when title is blank" do
        expect {
          post api_tasks_path, params: { task: { title: "" } }, as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to eq(
          "title" => ["can't be blank"],
        )
      end

      it "returns 422 when title exceeds 50 characters" do
        expect {
          post api_tasks_path,
               params: { task: { title: "a" * 51 } },
               as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to eq(
          "title" => ["is too long (maximum is 50 characters)"],
        )
      end

      it "returns 422 when description exceeds 300 characters" do
        expect {
          post api_tasks_path,
               params: {
                 task: {
                   title: "Ok title",
                   description: "a" * 301,
                 },
               },
               as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to eq(
          "description" => ["is too long (maximum is 300 characters)"],
        )
      end

      it "returns 422 when tags exceed 50 characters" do
        expect {
          post api_tasks_path,
               params: {
                 task: {
                   title: "Ok title",
                   tags: "a" * 51,
                 },
               },
               as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to eq(
          "tags" => ["is too long (maximum is 50 characters)"],
        )
      end

      it "creates a task when description and tags are blank" do
        expect {
          post api_tasks_path,
               params: {
                 task: {
                   title: "Optional fields blank",
                   description: "",
                   tags: "",
                 },
               },
               as: :json
        }.to change { user.tasks.count }.by(1)
        expect(response).to have_http_status(:created)
      end

      it "creates a task with the current user's project_id" do
        project = user.projects.create!(name: "Alpha")

        post api_tasks_path,
             params: {
               task: {
                 title: "With project",
                 status: "todo",
                 priority: "low",
                 project_id: project.id,
               },
             },
             as: :json

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json["project_id"]).to eq(project.id)
        expect(json["project"]).to eq("id" => project.id, "name" => "Alpha")
        expect(user.tasks.find(json["id"]).project_id).to eq(project.id)
        expect_task_json_shape(json)
      end

      it "returns null project fields when project_id is omitted" do
        post api_tasks_path,
             params: {
               task: {
                 title: "No project",
                 status: "todo",
                 priority: "low",
               },
             },
             as: :json

        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json["project_id"]).to be_nil
        expect(json["project"]).to be_nil
        expect_task_json_shape(json)
      end

      it "returns 422 when project_id belongs to another user" do
        other = User.create!(
          email: "other-project-create@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other_project = other.projects.create!(name: "Other")

        expect {
          post api_tasks_path,
               params: {
                 task: {
                   title: "Bad project",
                   project_id: other_project.id,
                 },
               },
               as: :json
        }.not_to change(Task, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to have_key("project_id")
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
        expect(response.parsed_body["errors"]).to eq(
          "title" => ["can't be blank"],
        )
        expect(task.reload.title).to eq("Keep")
      end

      it "returns not found when task does not exist" do
        patch api_task_path(999_999), params: { task: { status: "done" } }, as: :json

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body["error"]).to eq("Task not found")
      end

      it "returns not found when the task belongs to another user" do
        other = User.create!(
          email: "other-update@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other_task = other.tasks.create!(title: "Other update", status: :todo, priority: :low)

        patch api_task_path(other_task), params: { task: { status: "done" } }, as: :json

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body["error"]).to eq("Task not found")
        expect(other_task.reload.status).to eq("todo")
      end

      it "assigns and clears project_id" do
        project = user.projects.create!(name: "Beta")
        task = user.tasks.create!(title: "Patch project", status: :todo, priority: :low)

        patch api_task_path(task),
              params: { task: { project_id: project.id } },
              as: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["project_id"]).to eq(project.id)
        expect(json["project"]).to eq("id" => project.id, "name" => "Beta")
        expect(task.reload.project_id).to eq(project.id)

        patch api_task_path(task),
              params: { task: { project_id: nil } },
              as: :json

        expect(response).to have_http_status(:ok)
        cleared = response.parsed_body
        expect(cleared["project_id"]).to be_nil
        expect(cleared["project"]).to be_nil
        expect(task.reload.project_id).to be_nil
      end

      it "returns 422 when project_id belongs to another user" do
        other = User.create!(
          email: "other-project-update@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other_project = other.projects.create!(name: "Other")
        task = user.tasks.create!(title: "Keep project", status: :todo, priority: :low)

        patch api_task_path(task),
              params: { task: { project_id: other_project.id } },
              as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to have_key("project_id")
        expect(task.reload.project_id).to be_nil
      end
    end
  end
end
