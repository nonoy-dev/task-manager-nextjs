class User < ApplicationRecord
  has_secure_password
  has_many :projects, dependent: :destroy
  has_many :tasks, dependent: :destroy

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: true
end

