class RemoveTagsStringFromTasks < ActiveRecord::Migration[8.1]
  def up
    remove_column :tasks, :tags
  end

  def down
    add_column :tasks, :tags, :string, limit: 50
  end
end
