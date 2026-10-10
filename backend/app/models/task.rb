class Task < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  enum :status, { todo: 0, in_progress: 1, done: 2 }, default: :todo
  enum :priority, { low: 0, medium: 1, high: 2 }, default: :medium

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 300 }
  validates :tags, length: { maximum: 50 }
  validate :project_must_belong_to_same_user

  def as_json(options = nil)
    super(options).merge(
      "project" => project && { "id" => project.id, "name" => project.name },
    )
  end

  private

  def project_must_belong_to_same_user
    return if project_id.blank?
    return if Project.exists?(id: project_id, user_id: user_id)

    errors.add(:project_id, "is invalid")
  end
end

