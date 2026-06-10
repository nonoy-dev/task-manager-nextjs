# frozen_string_literal: true

# Keys expected by the React client's TaskDto (snake_case JSON from Rails).
TASK_JSON_KEYS = %w[
  id title description status priority due_date tags created_at updated_at
].freeze

module TaskApiJson
  def expect_task_json_shape(json)
    expect(json.keys).to match_array(TASK_JSON_KEYS)
  end
end

RSpec.configure do |config|
  config.include TaskApiJson, type: :request
end
