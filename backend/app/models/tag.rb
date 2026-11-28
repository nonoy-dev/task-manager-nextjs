class Tag < ApplicationRecord
  NAME_MAX_LENGTH = 20

  belongs_to :user
  has_many :task_tags, dependent: :destroy
  has_many :tasks, through: :task_tags

  validates :name, presence: true, length: { maximum: NAME_MAX_LENGTH }
  validates :name, uniqueness: { scope: :user_id }
  validate :name_must_be_normalized

  private

  def name_must_be_normalized
    return if name.blank?
    return if name == name.strip.downcase

    errors.add(:name, "is invalid")
  end
end
