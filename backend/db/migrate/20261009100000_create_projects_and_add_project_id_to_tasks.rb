class CreateProjectsAndAddProjectIdToTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string :name, null: false, limit: 50
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_reference :tasks, :project, null: true, foreign_key: true
  end
end
