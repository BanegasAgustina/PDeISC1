export default function TaskStats({ tareas }) {
  // Resume el estado de las tareas sin usar cards grandes en la pantalla principal.
  const completadas = tareas.filter((t) => t.completada).length
  const stats = [{ label: 'Total', value: tareas.length }, { label: 'Completadas', value: completadas }, { label: 'Pendientes', value: tareas.length - completadas }]
  return <section className="stats" aria-label="Resumen de tareas">{stats.map((stat) => <span className="stat-card" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></span>)}</section>
}
