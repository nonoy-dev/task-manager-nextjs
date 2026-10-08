class Task < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  enum :status, { todo: 0, in_progress: 1, done: 2 }, default: :todo
  enum :priority, { low: 0, medium: 1, high: 2 }, default: :medium

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 300 }
  validates :tags, length: { maximum: 50 }
  validate :project_belongs_to_same_user

  private

  def project_belongs_to_same_user
    return if project.blank?
    return if project.user_id == user_id

    errors.add(:project, "must belong to the same user")
  end
end
