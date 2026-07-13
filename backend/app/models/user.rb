class User < ApplicationRecord
  has_secure_password
  has_many :tasks, dependent: :destroy

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: true
end
