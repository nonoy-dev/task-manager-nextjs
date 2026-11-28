class TaskTag < ApplicationRecord
  belongs_to :task
  belongs_to :tag
  belongs_to :user

  validates :tag_id, uniqueness: { scope: :task_id }
  validates :position, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, uniqueness: { scope: :task_id }
  validate :user_matches_task_and_tag

  private

  def user_matches_task_and_tag
    errors.add(:user, "is invalid") if task && user_id != task.user_id
    errors.add(:user, "is invalid") if tag && user_id != tag.user_id
  end
end
