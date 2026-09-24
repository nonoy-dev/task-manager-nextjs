# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Rails time zone" do
  it "uses Asia/Tokyo" do
    expect(Time.zone.name).to eq("Asia/Tokyo")
  end
end
