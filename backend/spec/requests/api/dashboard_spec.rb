# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Dashboard", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let!(:user) do
    User.create!(
      email: "dashboard-spec@example.com",
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
    it "returns 401 for GET /api/dashboard" do
      get api_dashboard_path

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end
  end

  describe "when authenticated" do
    before { login_as(user) }

    it "returns overdue and due-today incomplete tasks with meta counts" do
      travel_to Time.zone.local(2026, 9, 20) do
        overdue = user.tasks.create!(
          title: "Overdue task",
          status: :todo,
          priority: :high,
          due_date: Date.new(2026, 9, 19),
        )
        due_today = user.tasks.create!(
          title: "Due today",
          status: :in_progress,
          priority: :medium,
          due_date: Date.new(2026, 9, 20),
        )
        user.tasks.create!(
          title: "Later",
          status: :todo,
          priority: :low,
          due_date: Date.new(2026, 9, 21),
        )
        user.tasks.create!(
          title: "No due date",
          status: :todo,
          priority: :low,
        )

        get api_dashboard_path

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["overdue"].map { |row| row["title"] }).to eq(["Overdue task"])
        expect(json["due_today"].map { |row| row["title"] }).to eq(["Due today"])
        expect(json["meta"]).to eq(
          "overdue" => 1,
          "due_today" => 1,
        )
        expect_task_json_shape(json["overdue"].first)
        expect_task_json_shape(json["due_today"].first)
        expect(json["overdue"].first["id"]).to eq(overdue.id)
        expect(json["due_today"].first["id"]).to eq(due_today.id)
      end
    end

    it "excludes completed tasks even when their due date is overdue or today" do
      travel_to Time.zone.local(2026, 9, 20) do
        user.tasks.create!(
          title: "Done overdue",
          status: :done,
          priority: :high,
          due_date: Date.new(2026, 9, 19),
        )
        user.tasks.create!(
          title: "Done today",
          status: :done,
          priority: :medium,
          due_date: Date.new(2026, 9, 20),
        )

        get api_dashboard_path

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["overdue"]).to eq([])
        expect(json["due_today"]).to eq([])
        expect(json["meta"]).to eq(
          "overdue" => 0,
          "due_today" => 0,
        )
      end
    end

    it "does not include other users tasks" do
      travel_to Time.zone.local(2026, 9, 20) do
        other = User.create!(
          email: "other-dashboard@example.com",
          password: "password",
          password_confirmation: "password",
        )
        other.tasks.create!(
          title: "Other overdue",
          status: :todo,
          priority: :high,
          due_date: Date.new(2026, 9, 19),
        )
        other.tasks.create!(
          title: "Other due today",
          status: :todo,
          priority: :medium,
          due_date: Date.new(2026, 9, 20),
        )
        mine = user.tasks.create!(
          title: "Mine overdue",
          status: :todo,
          priority: :low,
          due_date: Date.new(2026, 9, 19),
        )

        get api_dashboard_path

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["overdue"].map { |row| row["title"] }).to eq(["Mine overdue"])
        expect(json["due_today"]).to eq([])
        expect(json["meta"]).to eq(
          "overdue" => 1,
          "due_today" => 0,
        )
        expect(json["overdue"].first["id"]).to eq(mine.id)
      end
    end

    it "returns empty arrays and zero meta when there are no attention tasks" do
      travel_to Time.zone.local(2026, 9, 20) do
        get api_dashboard_path

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["overdue"]).to eq([])
        expect(json["due_today"]).to eq([])
        expect(json["meta"]).to eq(
          "overdue" => 0,
          "due_today" => 0,
        )
      end
    end
  end
end
