module Api
  class HealthController < ApplicationController
    def show
      render json: { message: "Rails API is running", timestamp: Time.current.iso8601 }
    end
  end
end
