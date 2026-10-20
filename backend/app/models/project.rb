class Project < ApplicationRecord
  belongs_to :user
  has_many :tasks, dependent: :nullify

  validates :name, presence: true, length: { maximum: 50 }
end
