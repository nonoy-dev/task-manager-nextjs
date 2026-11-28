class CreateTaskTags < ActiveRecord::Migration[8.1]
  def change
    add_index :tasks, %i[id user_id], unique: true

    create_table :task_tags do |t|
      t.references :task, null: false, index: false, foreign_key: false
      t.references :tag, null: false, index: true, foreign_key: false
      t.bigint :user_id, null: false
      t.integer :position, null: false
      t.timestamps
    end

    add_index :task_tags, %i[task_id tag_id], unique: true
    add_index :task_tags, %i[task_id position], unique: true
    add_foreign_key :task_tags, :tasks,
                    column: %i[task_id user_id],
                    primary_key: %i[id user_id],
                    on_delete: :cascade
    add_foreign_key :task_tags, :tags,
                    column: %i[tag_id user_id],
                    primary_key: %i[id user_id],
                    on_delete: :cascade
  end
end
