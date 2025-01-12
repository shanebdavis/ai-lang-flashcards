const TagSelector = ({ title, tags, selectedTags, onTagToggle }) => {
  if (!tags?.length) return null

  return (
    <div className="tag-selector">
      <h3>{title}</h3>
      <div className="tag-buttons">
        {tags.map(tag => (
          <button
            key={tag}
            className={`tag-button ${selectedTags.has(tag) ? 'selected' : ''}`}
            onClick={() => onTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

export { TagSelector } 