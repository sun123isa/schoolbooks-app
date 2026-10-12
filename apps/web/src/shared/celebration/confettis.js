// =============================================================================
// Socle frontend — pluie de confettis sur un <canvas> (sans dépendance)
// Deux salves depuis les coins bas puis une pluie depuis le haut ; couleurs
// lues dans les tokens CSS. Renvoie une fonction d'arrêt.
//   const arreter = lancerConfettis(canvas);
// =============================================================================
const TOKENS_COULEURS = ['--tdb-vert', '--tdb-vert-clair', '--auth-jaune', '--auth-corail', '--auth-cyan', '--tdb-c4'];
const DUREE_MS = 4200;
const GRAVITE = 0.18;
const FROTTEMENT = 0.992;

function couleurs() {
  const styles = getComputedStyle(document.documentElement);
  return TOKENS_COULEURS.map((nom) => styles.getPropertyValue(nom).trim()).filter(Boolean);
}

const hasard = (min, max) => min + Math.random() * (max - min);

function particule(x, y, angle, vitesse, palette) {
  return {
    x,
    y,
    vx: Math.cos(angle) * vitesse,
    vy: Math.sin(angle) * vitesse,
    taille: hasard(6, 11),
    rotation: hasard(0, Math.PI * 2),
    vitesseRotation: hasard(-0.25, 0.25),
    oscillation: hasard(0, Math.PI * 2),
    forme: Math.random() < 0.35 ? 'rond' : 'ruban',
    couleur: palette[Math.floor(Math.random() * palette.length)]
  };
}

export function lancerConfettis(canvas) {
  const contexte = canvas.getContext('2d');
  if (!contexte) return () => {};
  const palette = couleurs();
  const ratio = window.devicePixelRatio || 1;
  let largeur = 0;
  let hauteur = 0;

  const dimensionner = () => {
    largeur = window.innerWidth;
    hauteur = window.innerHeight;
    canvas.width = largeur * ratio;
    canvas.height = hauteur * ratio;
    contexte.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  dimensionner();
  window.addEventListener('resize', dimensionner);

  // Salves : coin bas gauche vers le haut-droite, coin bas droit vers le haut-gauche.
  const particules = [];
  for (let i = 0; i < 90; i += 1) {
    particules.push(particule(0, hauteur, hasard(-1.35, -0.75), hasard(11, 20), palette));
    particules.push(particule(largeur, hauteur, hasard(-2.4, -1.8), hasard(11, 20), palette));
  }
  // Pluie différée depuis le haut.
  const pluie = setTimeout(() => {
    for (let i = 0; i < 70; i += 1) {
      particules.push(particule(hasard(0, largeur), hasard(-80, -10), hasard(1.2, 1.9), hasard(1, 4), palette));
    }
  }, 450);

  const debut = performance.now();
  let image;

  const dessiner = (maintenant) => {
    const ecoule = maintenant - debut;
    contexte.clearRect(0, 0, largeur, hauteur);
    // Fondu sur la dernière seconde.
    contexte.globalAlpha = Math.max(0, Math.min(1, (DUREE_MS - ecoule) / 1000));
    for (const p of particules) {
      p.vx *= FROTTEMENT;
      p.vy = p.vy * FROTTEMENT + GRAVITE;
      p.oscillation += 0.08;
      p.x += p.vx + Math.sin(p.oscillation) * 0.6;
      p.y += p.vy;
      p.rotation += p.vitesseRotation;
      contexte.save();
      contexte.translate(p.x, p.y);
      contexte.rotate(p.rotation);
      contexte.fillStyle = p.couleur;
      if (p.forme === 'rond') {
        contexte.beginPath();
        contexte.arc(0, 0, p.taille / 2.6, 0, Math.PI * 2);
        contexte.fill();
      } else {
        // Ruban qui « tourne » : largeur modulée pour simuler la rotation en 3D.
        contexte.fillRect(-p.taille / 2, -p.taille / 4, p.taille * Math.abs(Math.cos(p.oscillation)), p.taille / 2);
      }
      contexte.restore();
    }
    if (ecoule < DUREE_MS) image = requestAnimationFrame(dessiner);
    else contexte.clearRect(0, 0, largeur, hauteur);
  };
  image = requestAnimationFrame(dessiner);

  return () => {
    clearTimeout(pluie);
    cancelAnimationFrame(image);
    window.removeEventListener('resize', dimensionner);
    contexte.clearRect(0, 0, largeur, hauteur);
  };
}
