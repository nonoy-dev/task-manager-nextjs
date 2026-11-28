# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_28_100400) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "projects", force: :cascade do |t|
    t.string "name", limit: 50, null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 20, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["id", "user_id"], name: "index_tags_on_id_and_user_id", unique: true
    t.index ["user_id", "name"], name: "index_tags_on_user_id_and_name", unique: true
    t.check_constraint "char_length(name::text) > 0 AND name::text = btrim(name::text) AND name::text = lower(name::text)", name: "tags_name_normalized"
  end

  create_table "task_tags", force: :cascade do |t|
    t.bigint "task_id", null: false
    t.bigint "tag_id", null: false
    t.bigint "user_id", null: false
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id"], name: "index_task_tags_on_tag_id"
    t.index ["task_id", "position"], name: "index_task_tags_on_task_id_and_position", unique: true
    t.index ["task_id", "tag_id"], name: "index_task_tags_on_task_id_and_tag_id", unique: true
  end

  create_table "tasks", force: :cascade do |t|
    t.string "title", limit: 50, null: false
    t.string "description", limit: 300
    t.integer "status", default: 0, null: false
    t.integer "priority", default: 1, null: false
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.bigint "project_id"
    t.index ["id", "user_id"], name: "index_tasks_on_id_and_user_id", unique: true
    t.index ["project_id"], name: "index_tasks_on_project_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "projects", "users"
  add_foreign_key "tags", "users"
  add_foreign_key "task_tags", "tags", column: ["tag_id", "user_id"], primary_key: ["id", "user_id"], on_delete: :cascade
  add_foreign_key "task_tags", "tasks", column: ["task_id", "user_id"], primary_key: ["id", "user_id"], on_delete: :cascade
  add_foreign_key "tasks", "projects"
  add_foreign_key "tasks", "users"
end
