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

  describe "POST /api/sessions" do
    it "creates a session when credentials are valid" do
      post api_sessions_path,
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
      post api_sessions_path,
           params: { email: user.email, password: "wrong" },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Invalid email or password")
      expect(session[:user_id]).to be_nil
    end
  end

  describe "DELETE /api/sessions" do
    it "clears the session" do
      post api_sessions_path,
           params: { email: user.email, password: "password" },
           as: :json

      delete api_sessions_path, as: :json

      expect(response).to have_http_status(:no_content)
      expect(session[:user_id]).to be_nil
    end
  end
end
