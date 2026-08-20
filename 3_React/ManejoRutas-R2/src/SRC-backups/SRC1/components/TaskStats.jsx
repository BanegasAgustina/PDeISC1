export default function TaskStats({ tareas }) {
  const completadas = tareas.filter((t) => t.completada).length
  const stats = [{ label: 'Total de tareas', value: tareas.length, icon: '◫', tone: 'purple' }, { label: 'Completadas', value: completadas, icon: '✓', tone: 'green' }, { label: 'Pendientes', value: tareas.length - completadas, icon: '◷', tone: 'orange' }]
  return <section className="stats" aria-label="Resumen de tareas">{stats.map((stat) => <article className="stat-card" key={stat.label}><span className={`stat-icon ${stat.tone}`}>{stat.icon}</span><div><strong>{stat.value}</strong><p>{stat.label}</p></div></article>)}</section>
}
