# frozen_string_literal: true

FactoryBot.define do
  factory :task do
    association :user
    sequence(:title) { |n| "Task #{n}" }
    status { :todo }
    priority { :medium }
    project { nil }

    transient do
      tag_names { nil }
    end

    after(:build) do |task, evaluator|
      next if evaluator.tag_names.nil?

      task.tag_names = evaluator.tag_names
    end
  end
end
