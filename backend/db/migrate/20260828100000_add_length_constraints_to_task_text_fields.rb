class AddLengthConstraintsToTaskTextFields < ActiveRecord::Migration[8.1]
  def change
    change_column :tasks, :title, :string, limit: 50, null: false
    change_column :tasks, :description, :string, limit: 300
    change_column :tasks, :tags, :string, limit: 50
  end
end
