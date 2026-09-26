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
      travel_to Time.zone.local(2026, 9, 20, 15, 0, 0) do
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
  end
end
