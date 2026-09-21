class ChangeTasksDueDateToDate < ActiveRecord::Migration[8.1]
  def up
    change_column :tasks, :due_date, :date,
      using: "((due_date AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Tokyo')::date"
  end

  def down
    change_column :tasks, :due_date, :datetime,
      using: "((due_date::timestamp AT TIME ZONE 'Asia/Tokyo') AT TIME ZONE 'UTC')"
  end
end
