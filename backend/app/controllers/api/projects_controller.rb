module Api
  class ProjectsController < ApplicationController
    before_action :authenticate_user!

    def index
      projects = current_user_projects.order(:name, :id)

      render json: projects
    end

    def create
      project = current_user_projects.build(project_params)

      if project.save
        render json: project, status: :created
      else
        render json: { errors: project.errors }, status: :unprocessable_content
      end
    end

    private

    def project_params
      params.require(:project).permit(:name)
    end
  end
end
