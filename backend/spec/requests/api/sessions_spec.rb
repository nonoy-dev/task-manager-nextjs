# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Sessions", type: :request do
  let!(:user) do
    User.create!(
      email: "session-spec@example.com",
      password: "password",
      password_confirmation: "password",
    )
  end

  describe "POST /api/session" do
    it "creates a session when credentials are valid" do
      post api_session_path,
           params: { email: user.email, password: "password" },
           as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to eq(
        "id" => user.id,
        "email" => user.email,
      )
      expect(session[:user_id]).to eq(user.id)
    end

    it "returns unauthorized when credentials are invalid" do
      post api_session_path,
           params: { email: user.email, password: "wrong" },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Invalid email or password")
      expect(session[:user_id]).to be_nil
    end
  end

  describe "GET /api/session" do
    it "returns the current user when a session exists" do
      post api_session_path,
           params: { email: user.email, password: "password" },
           as: :json

      get api_session_path, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq(
        "id" => user.id,
        "email" => user.email,
      )
    end

    it "returns unauthorized when no session exists" do
      get api_session_path, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end
  end

  describe "DELETE /api/session" do
    it "clears the session" do
      post api_session_path,
           params: { email: user.email, password: "password" },
           as: :json

      delete api_session_path, as: :json

      expect(response).to have_http_status(:no_content)
      expect(session[:user_id]).to be_nil
    end

    it "removes the session cookie so cookie-presence checks treat the user as logged out" do
      post api_session_path,
           params: { email: user.email, password: "password" },
           as: :json
      expect(response.cookies["_backend_session"]).to be_present

      delete api_session_path, as: :json

      expect(response).to have_http_status(:no_content)
      expect(response.cookies["_backend_session"]).to be_blank
      get api_session_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
