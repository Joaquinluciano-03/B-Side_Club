// texto partido en letras para animarlas; cada una lleva --n (su posición) y la clase que le pasen. El lector de pantalla lee el texto entero

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
