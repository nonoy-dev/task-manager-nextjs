module Api
  class SessionsController < ApplicationController
    def create
      user = User.find_by(email: params[:email])

      if user&.authenticate(params[:password])
        reset_session
        session[:user_id] = user.id
        render json: { id: user.id, email: user.email }, status: :created
      else
        render json: { error: "Invalid email or password" }, status: :unauthorized
      end
    end

    def show
      if current_user
        render json: { id: current_user.id, email: current_user.email }
      else
        render json: { error: "Unauthorized" }, status: :unauthorized
      end
    end

    def destroy
      reset_session
      head :no_content
    end
  end
end
