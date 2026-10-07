module Api
  class DashboardsController < ApplicationController
    before_action :authenticate_user!

    def show
      overdue, due_today = attention_tasks

      render json: {
        overdue: overdue,
        due_today: due_today,
        meta: {
          overdue: overdue.size,
          due_today: due_today.size,
        },
      }
    end

    private

    def attention_tasks
      today = Time.zone.today
      scope = current_user_tasks.where.not(status: :done).where.not(due_date: nil)

      overdue = scope.where("due_date < ?", today).to_a
      due_today = scope.where(due_date: today).to_a

      [overdue, due_today]
    end
  end
end
