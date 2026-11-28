# frozen_string_literal: true

require "rails_helper"

RSpec.describe Task, type: :model do
  let(:user) { create(:user) }

  describe ".tag_counts_for" do
    it "aggregates distinct tags with counts, most used first" do
      create(:task, user: user, title: "A", tag_names: %w[work urgent])
      create(:task, user: user, title: "B", tag_names: %w[work])
      create(:task, user: user, title: "C", tag_names: %w[personal])
      create(:task, user: user, title: "D")

      expect(Task.tag_counts_for(user.tasks)).to eq(
        [
          { "name" => "work", "count" => 2 },
          { "name" => "personal", "count" => 1 },
          { "name" => "urgent", "count" => 1 },
        ],
      )
    end

    it "does not include another user's tags" do
      other = create(:user)
      create(:task, user: other, title: "Other", tag_names: %w[secret])
      create(:task, user: user, title: "Mine", tag_names: %w[work])

      expect(Task.tag_counts_for(user.tasks)).to eq(
        [{ "name" => "work", "count" => 1 }],
      )
    end
  end

  describe "tag names" do
    it "trims and lowercases names and keeps first-seen order" do
      task = create(:task, user: user, tag_names: [" work ", "Urgent", " work "])

      expect(task.reload.tag_names).to eq(%w[work urgent])
    end

    it "reuses one tag row for the same user and name" do
      first = create(:task, user: user, title: "A", tag_names: %w[work])
      second = create(:task, user: user, title: "B", tag_names: %w[work])

      expect(first.tags).to eq(second.tags)
      expect(user.tags.count).to eq(1)
    end

    it "keeps a separate tag row when another user uses the same name" do
      other = create(:user)
      create(:task, user: user, tag_names: %w[work])
      create(:task, user: other, tag_names: %w[work])

      expect(Tag.where(name: "work").count).to eq(2)
    end

    it "rejects a second tag with the same name for one user" do
      user.tags.create!(name: "work")
      duplicate = user.tags.build(name: "work")

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to eq(["has already been taken"])
      expect {
        Tag.insert_all!([
          {
            user_id: user.id,
            name: "work",
            created_at: Time.current,
            updated_at: Time.current,
          },
        ])
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it "rejects a link to another user's tag" do
      task = create(:task, user: user)
      other = create(:user)
      foreign_tag = other.tags.create!(name: "work")
      link = task.task_tags.build(tag: foreign_tag, user: user, position: 0)

      expect(link).not_to be_valid
      expect {
        TaskTag.insert_all!([
          {
            task_id: task.id,
            tag_id: foreign_tag.id,
            user_id: user.id,
            position: 0,
            created_at: Time.current,
            updated_at: Time.current,
          },
        ])
      }.to raise_error(ActiveRecord::InvalidForeignKey)
    end

    it "rejects a name that is blank, spaced, or not lowercase" do
      expect(user.tags.build(name: "Work")).not_to be_valid
      expect(user.tags.build(name: " work")).not_to be_valid

      expect {
        Tag.insert_all!([
          {
            user_id: user.id,
            name: "Work",
            created_at: Time.current,
            updated_at: Time.current,
          },
        ])
      }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it "reorders tags on a task" do
      task = create(:task, user: user, tag_names: %w[work urgent])

      task.update!(tag_names: %w[urgent work])

      expect(task.reload.tag_names).to eq(%w[urgent work])
    end

    it "rejects two links at the same position" do
      task = create(:task, user: user, tag_names: %w[work])
      home = user.tags.create!(name: "home")
      link = task.task_tags.build(tag: home, user: user, position: 0)

      expect(link).not_to be_valid
      expect {
        TaskTag.insert_all!([
          {
            task_id: task.id,
            tag_id: home.id,
            user_id: user.id,
            position: 0,
            created_at: Time.current,
            updated_at: Time.current,
          },
        ])
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it "replaces tags on update and drops names no task uses" do
      task = create(:task, user: user, tag_names: %w[personal])

      task.update!(tag_names: ["  home ", " chores  "])

      expect(task.reload.tag_names).to eq(%w[home chores])
      expect(user.tags.pluck(:name)).to contain_exactly("home", "chores")
    end

    it "stores no tags when the list is blank" do
      task = create(:task, user: user, tag_names: [" ", ""])

      expect(task.reload.tag_names).to eq([])
      expect(user.tags).to be_empty
    end

    it "rejects a tag longer than 20 characters" do
      task = build(:task, user: user, tag_names: ["a" * 21])

      expect(task).not_to be_valid
      expect(task.errors[:tags]).to eq(["is too long (maximum is 20 characters)"])
    end
  end
end
