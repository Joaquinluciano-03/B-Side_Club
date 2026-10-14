// Estados compartidos: skeleton de carga, vacio y error.
// El skeleton replica el de la demo (gradiente que barre, keyframes bskel).

export function SkeletonGrilla({ cantidad = 8 }) {
  return (
    <div className="grilla-productos">
      {Array.from({ length: cantidad }, (_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--superficie)',
            border: '1px solid var(--borde)',
            borderRadius: 'var(--r-card)',
            overflow: 'hidden',
          }}
        >
          <div className="skel" style={{ aspectRatio: '1 / 1' }} />
          <div
            style={{
              padding: '14px 15px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            <div className="skel-linea" style={{ width: '38%', height: 10 }} />
            <div className="skel-linea" style={{ width: '82%', height: 13 }} />
            <div className="skel-linea" style={{ width: '56%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Vacio({ titulo, texto, children }) {
  return (
    <div className="vacio">
      <div className="vacio-titulo">{titulo}</div>
      {texto && <div className="vacio-texto">{texto}</div>}
      {children}
    </div>
  );
}

// OJO con el nombre: si este componente se llamara "Error", taparia el
// constructor global Error en todos los modulos que lo importen, y un
// throw new Error(...) ahi adentro reventaria de forma muy confusa.
export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className="vacio">
      <div className="vacio-titulo">NO CARGÓ</div>
      <div className="vacio-texto">{mensaje}</div>
      {onReintentar && (
        <button className="btn btn-secundario" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '.2em',
        color: 'var(--tinta-tenue)',
        textTransform: 'uppercase',
      }}
    >
      {texto}
    </div>
  );
}
