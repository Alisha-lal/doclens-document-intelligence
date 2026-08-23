import "./TopicsPanel.css";

export default function TopicsPanel({ topics, entities }) {
  return (
    <section className="panel topics-panel" aria-labelledby="topics-heading">
      <h3 id="topics-heading" className="panel__title">
        Topics
      </h3>
      <div className="topics-panel__pills">
        {topics.map((topic) => (
          <span className="pill pill--topic" key={topic}>
            {topic}
          </span>
        ))}
      </div>

      {entities?.length > 0 && (
        <div className="topics-panel__entities">
          <p className="panel__eyebrow">Important entities</p>
          <div className="topics-panel__pills">
            {entities.map((entity) => (
              <span className="pill pill--entity" key={entity}>
                {entity}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
