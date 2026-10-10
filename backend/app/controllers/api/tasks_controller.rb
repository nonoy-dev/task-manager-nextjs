module Api
  class TasksController < ApplicationController
    PER_PAGE = 20

    before_action :authenticate_user!
    before_action :set_task, only: %i[show update destroy]

    def index
      tasks = current_user_tasks
      tasks = apply_title_description_search(tasks, params[:q])
      tasks = apply_status_filter(tasks, params[:status])
      tasks = apply_priority_filter(tasks, params[:priority])
      tasks = apply_sort(tasks, params[:sort], params[:direction])

      page = normalize_page(params[:page])
      total = tasks.count
      total_pages = total.zero? ? 0 : (total.to_f / PER_PAGE).ceil
      page_tasks = tasks.includes(:project).limit(PER_PAGE).offset((page - 1) * PER_PAGE)

      render json: {
        tasks: page_tasks,
        meta: {
          page: page,
          per_page: PER_PAGE,
          total: total,
          total_pages: total_pages,
        },
      }
    end

    def show
      render json: @task
    end

    def create
      task = current_user_tasks.build(task_params)

      if task.save
        render json: task, status: :created
      else
        render json: { errors: task.errors }, status: :unprocessable_content
      end
    end

    def update
      if @task.update(task_params)
        render json: @task
      else
        render json: { errors: @task.errors }, status: :unprocessable_content
      end
    end

    def destroy
      @task.destroy!
      head :no_content
    end

    private

    def set_task
      @task = current_user_tasks.includes(:project).find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Task not found" }, status: :not_found
    end

    def apply_title_description_search(scope, raw_query)
      query = raw_query.to_s.strip
      return scope if query.blank?

      pattern = "%#{ActiveRecord::Base.sanitize_sql_like(query.downcase)}%"
      scope.where(
        "LOWER(tasks.title) LIKE ? OR LOWER(COALESCE(tasks.description, '')) LIKE ?",
        pattern,
        pattern,
      )
    end

    def apply_status_filter(scope, raw_status)
      s = raw_status.to_s.strip
      return scope if s.blank?
      return scope unless Task.statuses.key?(s)

      scope.where(status: s)
    end

    def apply_priority_filter(scope, raw_priority)
      p = raw_priority.to_s.strip
      return scope if p.blank?
      return scope unless Task.priorities.key?(p)

      scope.where(priority: p)
    end

    SORTABLE_COLUMNS = %w[created_at due_date].freeze

    def apply_sort(scope, raw_sort, raw_direction)
      key = raw_sort.to_s.strip
      key = "created_at" if key.blank?
      key = "created_at" unless SORTABLE_COLUMNS.include?(key)

      direction = raw_direction.to_s.downcase.strip == "asc" ? :asc : :desc

      scope.order(key => direction, id: direction)
    end

    def normalize_page(raw_page)
      page = raw_page.to_i
      page < 1 ? 1 : page
    end

    def task_params
      params.require(:task).permit(
        :title,
        :description,
        :status,
        :priority,
        :due_date,
        :tags,
        :project_id,
      )
    end
  end
end
