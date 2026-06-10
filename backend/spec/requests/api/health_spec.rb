# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::Health", type: :request do
  describe "GET /api/health" do
    it "returns ok with message and timestamp" do
      get api_health_path

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["message"]).to eq("Rails API is running")
      expect(json["timestamp"]).to be_present
    end
  end
end
