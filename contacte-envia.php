<?php
/* ============================================================
   contacte-envia.php — Gourmets de Tarragona
   Rep el formulari de pages/contacte.html i l'envia per correu
   a l'associació. Respon sempre en JSON: {"ok":true} o {"ok":false,"error":"codi"}.
   Es puja amb FileZilla a l'arrel del web, com qualsevol altre fitxer.
   ============================================================ */

const DESTI        = 'dmolina@gourmetsdetarragona.com'; // en Dami fa de gestor i reenvia a qui toqui
const REMITENT     = 'gourmetsdetarragona@gourmetsdetarragona.com';
const DOMINIS      = ['www.gourmetsdetarragona.com', 'gourmetsdetarragona.com'];
const MAX_NOM      = 120;
const MAX_ASSUMPTE = 160;
const MAX_MISSATGE = 5000;
const MIN_SEGONS   = 3;  // un humà triga més de 3 s a omplir-lo
const MAX_ENVIAMENTS_HORA = 5;
const MOTIUS = [
  'soci'       => 'Quiero ser socio',
  'restaurant' => 'Restaurante',
  'celler'     => 'Bodega',
  'premsa'     => 'Prensa',
  'altres'     => 'Otro',
];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respon($ok, $error = null, $codi = 200) {
  http_response_code($codi);
  echo json_encode($error ? ['ok' => $ok, 'error' => $error] : ['ok' => $ok]);
  exit;
}

/* El formulari pregunta primer si aquest servidor executa PHP */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['ping'])) {
  respon(true);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respon(false, 'metode', 405);
}

/* Només des del nostre propi web */
$origen = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host_origen = $origen ? parse_url($origen, PHP_URL_HOST) : null;
if ($host_origen && !in_array($host_origen, DOMINIS, true)) {
  respon(false, 'origen', 403);
}

/* Paranys antirobots: camp ocult ple o enviament massa ràpid.
   Es respon "ok" perquè el robot no insisteixi, però no s'envia res. */
if (!empty($_POST['web'])) {
  respon(true);
}
$inici_ms = (int)($_POST['t'] ?? 0);
if ($inici_ms > 0 && (time() - intdiv($inici_ms, 1000)) < MIN_SEGONS) {
  respon(true);
}

/* Límit d'enviaments per IP i hora (fitxer temporal, sense base de dades) */
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'desconeguda');
$ip = trim(explode(',', $ip)[0]);
$fitxer = rtrim(sys_get_temp_dir(), '/\\') . '/gdt-contacte-' . md5($ip);
$ara = time();
$registre = [];
if (is_readable($fitxer)) {
  $registre = array_values(array_filter(
    array_map('intval', explode(',', (string)file_get_contents($fitxer))),
    function ($t) use ($ara) { return $t > $ara - 3600; }
  ));
}
if (count($registre) >= MAX_ENVIAMENTS_HORA) {
  respon(false, 'massa', 429);
}

/* Validació. Els salts de línia es treuen dels camps curts per evitar injecció de capçaleres. */
function net($valor, $max) {
  $v = trim(str_replace(["\r", "\n", "\0"], ' ', (string)$valor));
  return mb_substr($v, 0, $max, 'UTF-8');
}
$nom        = net($_POST['nom'] ?? '', MAX_NOM);
$email      = net($_POST['email'] ?? '', 254);
$motiu      = (string)($_POST['motiu'] ?? 'altres');
$assumpte   = net($_POST['assumpte'] ?? '', MAX_ASSUMPTE);
$missatge   = mb_substr(trim(str_replace("\0", '', (string)($_POST['missatge'] ?? ''))), 0, MAX_MISSATGE, 'UTF-8');
$privacitat = ($_POST['privacitat'] ?? '') === 'si';

if ($nom === '')                                respon(false, 'nom', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respon(false, 'email', 422);
if (mb_strlen($missatge, 'UTF-8') < 5)          respon(false, 'missatge', 422);
if (!$privacitat)                               respon(false, 'privacitat', 422);
if (!array_key_exists($motiu, MOTIUS))          $motiu = 'altres';

/* Correu */
$etiqueta = MOTIUS[$motiu];
$titol = '[Web] ' . $etiqueta . ($assumpte !== '' ? ' · ' . $assumpte : '');
$cos = "Mensaje desde el formulario de contacto de la web\n\n"
     . "Motivo: $etiqueta\n"
     . "Nombre: $nom\n"
     . "Email:  $email\n"
     . ($assumpte !== '' ? "Asunto: $assumpte\n" : '')
     . "Fecha:  " . date('d/m/Y H:i') . "\n"
     . "----------------------------------------\n\n"
     . $missatge . "\n\n"
     . "----------------------------------------\n"
     . "Para contestar, responde a este correo: la respuesta va directamente a $email.\n"
     . "La persona ha aceptado la política de privacidad.\n";
$capcaleres = implode("\r\n", [
  'From: =?UTF-8?B?' . base64_encode('Web Gourmets de Tarragona') . '?= <' . REMITENT . '>',
  'Reply-To: ' . $email,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
]);

$enviat = mail(DESTI, '=?UTF-8?B?' . base64_encode($titol) . '?=', $cos, $capcaleres, '-f' . REMITENT);
if (!$enviat) {
  error_log('contacte-envia.php: mail() ha fallat');
  respon(false, 'enviament', 500);
}

$registre[] = $ara;
@file_put_contents($fitxer, implode(',', $registre), LOCK_EX);
respon(true);
