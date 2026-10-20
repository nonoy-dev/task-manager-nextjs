# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

demo_user = User.find_or_create_by!(email: "demo@example.com") do |user|
  user.password = "password"
  user.password_confirmation = "password"
end

work = demo_user.projects.find_or_create_by!(name: "Work")
personal = demo_user.projects.find_or_create_by!(name: "Personal")

seed_tasks = [
  {
    title: "Buy groceries",
    description: "Milk, eggs, and bread",
    status: :todo,
    priority: :medium,
    due_date: Time.zone.today + 2,
    tags: "personal,errand",
    project: personal,
  },
  {
    title: "Prepare sprint report",
    description: "Collect progress updates from the team",
    status: :in_progress,
    priority: :high,
    due_date: Time.zone.today + 1,
    tags: "work,report",
    project: work,
  },
  {
    title: "Book health checkup",
    description: "Reserve annual checkup slot",
    status: :done,
    priority: :low,
    due_date: Time.zone.today - 7,
    tags: "personal,health",
    project: nil,
  },
]

seed_tasks.each do |attrs|
  demo_user.tasks.find_or_create_by!(title: attrs[:title]) do |task|
    task.description = attrs[:description]
    task.status = attrs[:status]
    task.priority = attrs[:priority]
    task.due_date = attrs[:due_date]
    task.tags = attrs[:tags]
    task.project = attrs[:project]
  end
end
