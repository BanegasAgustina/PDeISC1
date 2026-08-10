// TarjetaPresentacion.tsx - Componente hijo reutilizable

// Defino la forma que deben tener las props (tipo TypeScript)
type TarjetaPresentacionProps = {
  nombre: string;
  apellido: string;
  profesion: string;
  imagen: string;
};

// Desestructuro las props directamente en los parámetros
function TarjetaPresentacion({
  nombre,
  apellido,
  profesion,
  imagen,
}: TarjetaPresentacionProps) {
  return (
    <article className="tarjeta-presentacion">
      {/* src usa la variable imagen; alt con template string */}
      <img src={imagen} alt={`Retrato de ${nombre} ${apellido}`} />
      <div>
        <span>Perfil profesional</span>
        <h1>
          {nombre} {apellido}
        </h1>
        <p>{profesion}</p>
      </div>
    </article>
  );
}

export default TarjetaPresentacion;
