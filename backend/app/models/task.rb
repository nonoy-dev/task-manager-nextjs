class Task < ApplicationRecord
  belongs_to :user

  enum :status, { todo: 0, in_progress: 1, done: 2 }, default: :todo
  enum :priority, { low: 0, medium: 1, high: 2 }, default: :medium

  validates :title, presence: true
end
