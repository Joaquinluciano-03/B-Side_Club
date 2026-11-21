// nombre del local como logotipo de dos colores (la última palabra va en un <span>)

import { useDatosDelLocal, partirNombre } from '../lib/useStoreInfo';

export default function Logotipo() {
  const { nombre } = useDatosDelLocal();
  const { resto, ultima } = partirNombre(nombre);
  return (
    <>
      {resto}
      {ultima && (
        <>
          {' '}
          <span>{ultima}</span>
        </>
      )}
    </>
  );
}
