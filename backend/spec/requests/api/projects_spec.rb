# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Projects", type: :request do
  let!(:user) do
    User.create!(
      email: "projects-spec@example.com",
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
    it "returns 401 for GET /api/projects" do
      get api_projects_path

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end

    it "returns 401 for POST /api/projects" do
      post api_projects_path,
           params: { project: { name: "Nope" } },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end
  end

  describe "when authenticated" do
    before { login_as(user) }

    describe "GET /api/projects" do
      it "returns only the current user's projects ordered by name" do
        other = User.create!(
          email: "projects-other@example.com",
          password: "password",
          password_confirmation: "password",
        )
        user.projects.create!(name: "Beta")
        user.projects.create!(name: "Alpha")
        other.projects.create!(name: "Other")

        get api_projects_path

        expect(response).to have_http_status(:ok)
        names = response.parsed_body.map { |project| project["name"] }
        expect(names).to eq(%w[Alpha Beta])
      end

      it "returns an empty array when the user has no projects" do
        get api_projects_path

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq([])
      end
    end

    describe "POST /api/projects" do
      it "creates a project for the current user" do
        expect {
          post api_projects_path,
               params: { project: { name: "Work" } },
               as: :json
        }.to change(user.projects, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["name"]).to eq("Work")
        expect(body["user_id"]).to eq(user.id)
      end

      it "returns 422 when name is blank" do
        post api_projects_path,
             params: { project: { name: "" } },
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to have_key("name")
      end

      it "returns 422 when name exceeds 50 characters" do
        post api_projects_path,
             params: { project: { name: "a" * 51 } },
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to have_key("name")
      end
    end
  end
end
