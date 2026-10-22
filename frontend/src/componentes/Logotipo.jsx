// El nombre del local escrito como logotipo de dos colores ("B-SIDE CLUB"):
// la ultima palabra va en un <span> que cada lugar pinta con su color (el
// footer, el login y el panel). El nombre sale de la base (Info del local).

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
