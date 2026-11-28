class CreateTags < ActiveRecord::Migration[8.1]
  def change
    create_table :tags do |t|
      t.references :user, null: false, foreign_key: true, index: false
      t.string :name, null: false, limit: 20
      t.timestamps
    end

    add_index :tags, %i[user_id name], unique: true
    add_index :tags, %i[id user_id], unique: true
    add_check_constraint :tags,
                         "char_length(name) > 0 AND name = btrim(name) AND name = lower(name)",
                         name: "tags_name_normalized"
  end
end
