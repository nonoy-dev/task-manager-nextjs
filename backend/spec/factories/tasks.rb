# frozen_string_literal: true

FactoryBot.define do
  factory :task do
    association :user
    sequence(:title) { |n| "Task #{n}" }
    status { :todo }
    priority { :medium }
    project { nil }
  end
end
