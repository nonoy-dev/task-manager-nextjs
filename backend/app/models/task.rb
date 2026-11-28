class Task < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true
  has_many :task_tags, -> { order(:position) }, dependent: :destroy
  has_many :tags, through: :task_tags

  enum :status, { todo: 0, in_progress: 1, done: 2 }, default: :todo
  enum :priority, { low: 0, medium: 1, high: 2 }, default: :medium

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 300 }
  validate :project_must_belong_to_same_user
  validate :tag_names_must_be_an_array
  validate :tag_names_within_length

  after_save :sync_tag_names, if: :tag_names_assigned?
  after_destroy :delete_unused_tags

  def self.normalize_tag_names(raw)
    Array(raw).map { |item| item.to_s.strip.downcase }.reject(&:empty?).uniq
  end

  def self.tag_counts_for(scope)
    task_ids = scope.unscope(:order).select(:id)
    Tag.joins(:task_tags)
      .where(task_tags: { task_id: task_ids })
      .group(:name)
      .order(Arel.sql("COUNT(tags.id) DESC"), :name)
      .pluck(:name, Arel.sql("COUNT(tags.id)"))
      .map { |name, count| { "name" => name, "count" => count } }
  end

  def tag_names
    return @assigned_tag_names if tag_names_assigned?

    tags.map(&:name)
  end

  def tag_names=(raw)
    if raw.is_a?(Array)
      @tag_names_invalid = false
      @tag_names_assigned = true
      @assigned_tag_names = self.class.normalize_tag_names(raw)
    else
      @tag_names_invalid = true
      @tag_names_assigned = false
      @assigned_tag_names = nil
    end
  end

  def as_json(options = nil)
    super(options).merge(
      "tags" => tag_names,
      "project" => project && { "id" => project.id, "name" => project.name },
    )
  end

  private

  def tag_names_assigned?
    @tag_names_assigned == true
  end

  def tag_names_must_be_an_array
    return unless @tag_names_invalid

    errors.add(:tags, "is invalid")
  end

  def tag_names_within_length
    names = tag_names_assigned? ? @assigned_tag_names : []
    return if names.all? { |name| name.length <= Tag::NAME_MAX_LENGTH }

    errors.add(:tags, :too_long, count: Tag::NAME_MAX_LENGTH)
  end

  def sync_tag_names
    assigned_tags = @assigned_tag_names.map do |name|
      user.tags.find_or_create_by!(name: name)
    end
    task_tags.destroy_all
    write_tag_positions(assigned_tags)
    delete_unused_tags
    @tag_names_assigned = false
    tags.reset
    task_tags.reset
  end

  def write_tag_positions(assigned_tags)
    assigned_tags.each_with_index do |tag, index|
      task_tags.create!(tag: tag, user_id: user_id, position: index)
    end
  end

  def delete_unused_tags
    return if user_id.nil?

    Tag.where(user_id: user_id).where.missing(:task_tags).delete_all
  end

  def project_must_belong_to_same_user
    return if project_id.blank?
    return if Project.exists?(id: project_id, user_id: user_id)

    errors.add(:project_id, "is invalid")
  end
end
