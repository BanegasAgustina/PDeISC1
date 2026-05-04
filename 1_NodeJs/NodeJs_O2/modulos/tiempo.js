export function clima() {
  const climas = ['Soleado', 'Nublado', 'Lluvioso', 'Tormenta', 'Parcialmente nublado'];
  const index = new Date().getDate() % climas.length;
  return climas[index];
}
 