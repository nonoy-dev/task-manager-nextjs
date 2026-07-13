# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationController, type: :controller do
  controller(ApplicationController) do
    before_action :authenticate_user!

    def index
      render json: { id: current_user.id, email: current_user.email }
    end
  end

  let!(:user) do
    User.create!(
      email: "auth-spec@example.com",
      password: "password",
      password_confirmation: "password",
    )
  end

  describe "authenticate_user!" do
    it "returns 401 when there is no session" do
      get :index

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end

    it "allows the action when session has a valid user" do
      session[:user_id] = user.id

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq(
        "id" => user.id,
        "email" => user.email,
      )
    end
  end
end
