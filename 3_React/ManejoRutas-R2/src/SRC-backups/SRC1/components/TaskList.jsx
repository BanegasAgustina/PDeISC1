import TaskCard from './TaskCard'
export default function TaskList({ tareas }) { return <div className="task-list">{tareas.map((tarea) => <TaskCard key={tarea.id} tarea={tarea} />)}</div> }
