// Un texto partido en letras para animarlas de a una: cada letra lleva --n
// (su posicion) y la clase que le pase quien lo usa, que es quien decide la
// animacion. Las palabras no se cortan al bajar de renglon. El lector de
// pantalla lee el texto entero, no las letras sueltas.

export default function PorLetras({ texto, claseLetra = '' }) {
  let n = 0;
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {texto.split(' ').map((palabra, i) => (
          <span key={i}>
            {i > 0 && ' '}
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {[...palabra].map((letra) => (
                <span key={n} className={claseLetra} style={{ '--n': n++ }}>
                  {letra}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
