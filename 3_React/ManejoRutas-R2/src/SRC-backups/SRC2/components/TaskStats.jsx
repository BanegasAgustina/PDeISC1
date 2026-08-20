export default function TaskStats({ tareas }) {
  const completadas = tareas.filter((t) => t.completada).length
  const stats = [{ label: 'Total de tareas', value: tareas.length, icon: '◫', tone: 'purple' }, { label: 'Completadas', value: completadas, icon: '✓', tone: 'green' }, { label: 'Pendientes', value: tareas.length - completadas, icon: '◷', tone: 'orange' }]
  return <section className="stats" aria-label="Resumen de tareas">{stats.map((stat, index) => <span className="stat-card" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span>{index < stats.length - 1 && <i aria-hidden="true">·</i>}</span>)}</section>
}
