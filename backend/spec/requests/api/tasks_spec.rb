# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Tasks", type: :request do
  let!(:user) do
    create(:user, email: "tasks-spec@example.com")
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
        create(:task, user: user, title: "Alpha", status: :todo, priority: :low)

        get api_tasks_path

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json).to be_a(Hash)
        expect(json["tasks"]).to be_a(Array)
        expect(json["tasks"].size).to eq(1)
        expect(json["tasks"].first["title"]).to eq("Alpha")
        expect(json["tasks"].first["status"]).to eq("todo")
        expect_task_json_shape(json["tasks"].first)
        expect(json["meta"]).to include(
          "page" => 1,
          "per_page" => 20,
          "total" => 1,
          "total_pages" => 1,
        )
      end

      it "does not include other users tasks" do
        other = create(:user, email: "other-tasks@example.com")
        create(:task, user: other, title: "Other user task", status: :todo, priority: :low)
        create(:task, user: user, title: "Mine", status: :todo, priority: :low)

        get api_tasks_path

        expect(response).to have_http_status(:ok)
        titles = response.parsed_body["tasks"].map { |task| task["title"] }
        expect(titles).to eq(["Mine"])
      end

      it "filters by partial title match case-insensitively" do
        create(:task, user: user, title: "Meeting prep", status: :todo, priority: :low)
        create(:task, user: user, title: "Other", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "meet" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Meeting prep")
      end

      it "filters by partial description match" do
        create(:task, user: user, title: "Doc A", description: "Ruby on Rails", status: :todo, priority: :low)
        create(:task, user: user, title: "Doc B", description: "Python only", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "rails" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Doc A")
      end

      it "returns all tasks when q is blank" do
        create(:task, user: user, title: "One", status: :todo, priority: :low)
        create(:task, user: user, title: "Two", status: :todo, priority: :low)

        get api_tasks_path, params: { q: "   " }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "filters by status when status param is present" do
        create(:task, user: user, title: "Todo A", status: :todo, priority: :low)
        create(:task, user: user, title: "Done B", status: :done, priority: :low)

        get api_tasks_path, params: { status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Todo A")
        expect(json.first["status"]).to eq("todo")
      end

      it "filters by priority when priority param is present" do
        create(:task, user: user, title: "Low P", status: :todo, priority: :low)
        create(:task, user: user, title: "High P", status: :todo, priority: :high)

        get api_tasks_path, params: { priority: "high" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("High P")
        expect(json.first["priority"]).to eq("high")
      end

      it "filters by project when project param is present" do
        alpha = create(:project, user: user, name: "Alpha")
        beta = create(:project, user: user, name: "Beta")
        create(:task, user: user, title: "Alpha task", status: :todo, priority: :low, project: alpha)
        create(:task, user: user, title: "Beta task", status: :todo, priority: :low, project: beta)
        create(:task, user: user, title: "No project", status: :todo, priority: :low)

        get api_tasks_path, params: { project: alpha.id }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Alpha task")
        expect(json.first["project_id"]).to eq(alpha.id)
        expect(json.first["project"]).to eq("id" => alpha.id, "name" => "Alpha")
      end

      it "returns empty list when project belongs to another user" do
        other = create(:user, email: "other-project-filter@example.com")
        other_project = create(:project, user: other, name: "Other")
        create(:task, user: user, title: "Mine", status: :todo, priority: :low)

        get api_tasks_path, params: { project: other_project.id }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"]).to eq([])
      end

      it "includes tag_counts for all of the current user's tasks in meta" do
        create(:task, user: user, title: "A", status: :todo, priority: :low, tags: "work,urgent")
        create(:task, user: user, title: "B", status: :todo, priority: :low, tags: "work")
        other = create(:user, email: "other-tag-counts@example.com")
        create(:task, user: other, title: "Other", status: :todo, priority: :low, tags: "secret")

        get api_tasks_path, params: { tag: "urgent" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].map { |task| task["title"] }).to eq(["A"])
        expect(response.parsed_body["meta"]["tag_counts"]).to eq(
          [
            { "name" => "work", "count" => 2 },
            { "name" => "urgent", "count" => 1 },
          ],
        )
      end

      it "filters by an exact normalized tag and strips the tag param" do
        create(:task, user: user, title: "Tagged", status: :todo, priority: :low, tags: " work , urgent")
        create(:task, user: user, title: "Other tag", status: :todo, priority: :low, tags: "personal")
        create(:task, user: user, title: "Substring", status: :todo, priority: :low, tags: "network")
        create(:task, user: user, title: "Different case", status: :todo, priority: :low, tags: "Work")

        expect(Task.find_by!(title: "Tagged").tags).to eq("work,urgent")

        get api_tasks_path, params: { tag: "  work  " }

        expect(response).to have_http_status(:ok)
        titles = response.parsed_body["tasks"].map { |task| task["title"] }
        expect(titles).to eq(["Tagged"])
      end

      it "does not treat the tag param as a title or description search" do
        create(:task, user: user, title: "work notes", description: "work", status: :todo, priority: :low, tags: "personal")

        get api_tasks_path, params: { tag: "work" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"]).to eq([])
      end

      it "returns all tasks when tag is blank" do
        create(:task, user: user, title: "One", status: :todo, priority: :low, tags: "work")
        create(:task, user: user, title: "Two", status: :todo, priority: :low)

        get api_tasks_path, params: { tag: "   " }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "does not return another user's task with the same tag" do
        other = create(:user, email: "other-tag-filter@example.com")
        create(:task, user: other, title: "Other", status: :todo, priority: :low, tags: "work")
        create(:task, user: user, title: "Mine", status: :todo, priority: :low, tags: "work")

        get api_tasks_path, params: { tag: "work" }

        expect(response).to have_http_status(:ok)
        titles = response.parsed_body["tasks"].map { |task| task["title"] }
        expect(titles).to eq(["Mine"])
      end

      it "keeps title search independent when tag is also present" do
        create(:task, user: user, title: "Meeting notes", status: :todo, priority: :low, tags: "personal")
        create(:task, user: user, title: "Meeting tagged", status: :todo, priority: :low, tags: "work, urgent")
        create(:task, user: user, title: "Other tagged", status: :todo, priority: :low, tags: "work")

        get api_tasks_path, params: { q: "meeting", tag: "work" }

        expect(response).to have_http_status(:ok)
        titles = response.parsed_body["tasks"].map { |task| task["title"] }
        expect(titles).to eq(["Meeting tagged"])
      end

      it "ignores invalid project param" do
        create(:task, user: user, title: "One", status: :todo, priority: :low)
        create(:task, user: user, title: "Two", status: :todo, priority: :low)

        get api_tasks_path, params: { project: "not-a-number" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "includes nested project on list items" do
        project = create(:project, user: user, name: "Work")
        create(:task, user: user, title: "With project", status: :todo, priority: :low, project: project)
        create(:task, user: user, title: "Without project", status: :todo, priority: :low)

        get api_tasks_path

        expect(response).to have_http_status(:ok)
        by_title = response.parsed_body["tasks"].index_by { |row| row["title"] }
        expect(by_title["With project"]["project"]).to eq(
          "id" => project.id,
          "name" => "Work",
        )
        expect(by_title["Without project"]["project"]).to be_nil
        expect_task_json_shape(by_title["With project"])
        expect_task_json_shape(by_title["Without project"])
      end

      it "ignores invalid status param" do
        create(:task, user: user, title: "Todo A", status: :todo, priority: :low)
        create(:task, user: user, title: "Done B", status: :done, priority: :low)

        get api_tasks_path
        expect(response.parsed_body["tasks"].size).to eq(2)

        get api_tasks_path, params: { status: "not_a_real_status" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["tasks"].size).to eq(2)
      end

      it "combines q with status filter" do
        create(:task, user: user, title: "Alpha meeting", status: :todo, priority: :low)
        create(:task, user: user, title: "Beta meeting", status: :done, priority: :low)

        get api_tasks_path, params: { q: "meeting", status: "todo" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.size).to eq(1)
        expect(json.first["title"]).to eq("Alpha meeting")
      end

      it "sorts by created_at ascending when requested" do
        older = create(:task, user: user, title: "Older", status: :todo, priority: :low)
        newer = create(:task, user: user, title: "Newer", status: :todo, priority: :low)
        older.update_column(:created_at, 2.days.ago)
        newer.update_column(:created_at, 1.day.ago)

        get api_tasks_path, params: { sort: "created_at", direction: "asc" }

        expect(response).to have_http_status(:ok)
        json = response.parsed_body["tasks"]
        expect(json.map { |row| row["title"] }).to eq(%w[Older Newer])
      end

      it "sorts by due_date ascending when requested" do
        create(:task, user: user,
          title: "Later due",
          status: :todo,
          priority: :low,
          due_date: Date.new(2026, 12, 1),
        )
        create(:task, user: user,
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
        first = create(:task, user: user, title: "First", status: :todo, priority: :low)
        second = create(:task, user: user, title: "Second", status: :todo, priority: :low)
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
            task = create(:task, user: user,
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
          expect(json["meta"]).to include(
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
          expect(json["meta"]).to include(
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
          expect(json["meta"]).to include(
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
          expect(json["meta"]).to include(
            "page" => 1,
            "per_page" => 20,
            "total" => 0,
            "total_pages" => 0,
          )
        end

        it "paginates after filters so meta total reflects the filtered scope" do
          create_ordered_tasks(5)
          3.times do |i|
            task = create(:task, user: user,
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
          expect(json["meta"]).to include(
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
        task = create(:task, user: user, title: "Show", status: :todo, priority: :medium)

        get api_task_path(task)

        expect(response).to have_http_status(:ok)
      end

      it "returns the task as JSON" do
        task = create(:task, user: user, title: "Beta", status: :in_progress, priority: :high)

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
        other = create(:user, email: "other-show@example.com")
        other_task = create(:task, user: other, title: "Other show", status: :todo, priority: :low)

        get api_task_path(other_task)

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body["error"]).to eq("Task not found")
      end
    end

    describe "DELETE /api/tasks/:id" do
      it "destroys the task" do
        task = create(:task, user: user, title: "Delete me", status: :todo, priority: :low)

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
        other = create(:user, email: "other-destroy@example.com")
        other_task = create(:task, user: other, title: "Other delete", status: :todo, priority: :low)

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
        other = create(:user, email: "other-create@example.com")

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
        project = create(:project, user: user, name: "Alpha")

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
        other = create(:user, email: "other-project-create@example.com")
        other_project = create(:project, user: other, name: "Other")

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
        task = create(:task, user: user, title: "Patch target", status: :todo, priority: :medium)

        patch api_task_path(task), params: { task: { status: "done" } }, as: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["id"]).to eq(task.id)
        expect(json["status"]).to eq("done")
        expect(task.reload.status).to eq("done")
        expect_task_json_shape(json)
      end

      it "updates title and priority" do
        task = create(:task, user: user, title: "Before", status: :todo, priority: :low)

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

      it "updates and clears due_date" do
        task = create(:task, user: user, title: "Due date patch", status: :todo, priority: :low)

        patch api_task_path(task),
              params: { task: { due_date: "2026-12-01" } },
              as: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["due_date"]).to eq("2026-12-01")
        expect(task.reload.due_date).to eq(Date.new(2026, 12, 1))
        expect_task_json_shape(json)

        patch api_task_path(task),
              params: { task: { due_date: nil } },
              as: :json

        expect(response).to have_http_status(:ok)
        cleared = response.parsed_body
        expect(cleared["due_date"]).to be_nil
        expect(task.reload.due_date).to be_nil
      end

      it "updates description" do
        task = create(
          :task,
          user: user,
          title: "Desc patch",
          status: :todo,
          priority: :low,
          description: "Before",
        )

        patch api_task_path(task),
              params: { task: { description: "After details" } },
              as: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["description"]).to eq("After details")
        expect(task.reload.description).to eq("After details")
        expect_task_json_shape(json)
      end

      it "returns 422 when update is invalid" do
        task = create(:task, user: user, title: "Keep", status: :todo, priority: :low)

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
        other = create(:user, email: "other-update@example.com")
        other_task = create(:task, user: other, title: "Other update", status: :todo, priority: :low)

        patch api_task_path(other_task), params: { task: { status: "done" } }, as: :json

        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body["error"]).to eq("Task not found")
        expect(other_task.reload.status).to eq("todo")
      end

      it "assigns and clears project_id" do
        project = create(:project, user: user, name: "Beta")
        task = create(:task, user: user, title: "Patch project", status: :todo, priority: :low)

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
        other = create(:user, email: "other-project-update@example.com")
        other_project = create(:project, user: other, name: "Other")
        task = create(:task, user: user, title: "Keep project", status: :todo, priority: :low)

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
