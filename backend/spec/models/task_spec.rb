# frozen_string_literal: true

require "rails_helper"

RSpec.describe Task, type: :model do
  let(:user) { create(:user) }

  describe "tags normalization" do
    it "trims each tag and joins with a single comma on create" do
      task = create(:task, user: user, tags: " work , urgent ")

      expect(task.reload.tags).to eq("work,urgent")
    end

    it "normalizes tags on update" do
      task = create(:task, user: user, tags: "personal")

      task.update!(tags: "  home , chores  ")

      expect(task.reload.tags).to eq("home,chores")
    end

    it "stores nil when tags are blank or only commas and spaces" do
      blank = create(:task, user: user, tags: "")
      commas = create(:task, user: user, title: "Commas only", tags: " ,  , ")

      expect(blank.reload.tags).to be_nil
      expect(commas.reload.tags).to be_nil
    end

    it "validates length after normalization" do
      task = build(
        :task,
        user: user,
        tags: "#{'a' * 25}, #{'b' * 24} ",
      )

      expect(task).to be_valid
      expect(task.tags).to eq("#{'a' * 25},#{'b' * 24}")
    end
  end
end
