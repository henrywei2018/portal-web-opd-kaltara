<?php

/*
|--------------------------------------------------------------------------
| SSO Portal Kaltara
|--------------------------------------------------------------------------
| Login admin lewat https://portal.kaltaraprov.go.id (alur "code", lihat
| https://portal.kaltaraprov.go.id/docs/developer). Fitur aktif otomatis bila
| APPLICATION_ID dan API_KEY terisi; login username/password tetap tersedia.
|
| Callback URL yang didaftarkan admin portal: {APP_URL}/sso/callback
*/

$petaPeran = [];
foreach (array_filter(array_map('trim', explode(',', (string) env('SSO_PORTAL_PETA_PERAN', '')))) as $pasangan) {
    [$kodePortal, $peranLokal] = array_pad(array_map('trim', explode(':', $pasangan, 2)), 2, null);
    if ($kodePortal !== '' && $peranLokal) {
        $petaPeran[strtolower($kodePortal)] = $peranLokal;
    }
}

return [
    'url' => rtrim((string) env('SSO_PORTAL_URL', 'https://portal.kaltaraprov.go.id'), '/'),
    'application_id' => env('SSO_PORTAL_APPLICATION_ID'),
    'api_key' => env('SSO_PORTAL_API_KEY'),

    // Batas waktu panggilan server-ke-server ke portal (detik).
    'timeout' => (int) env('SSO_PORTAL_TIMEOUT', 10),

    // Realm pengguna yang boleh masuk panel admin. Bawaan hanya ASN.
    'realm' => array_values(array_filter(array_map('trim', explode(',', (string) env('SSO_PORTAL_REALM', 'asn-kaltara'))))),

    // Kode role aplikasi di portal -> peran lokal, format "kode:peran,kode:peran".
    // Kosong = kode role portal dipakai apa adanya bila sama dengan nama peran
    // lokal (admin, editor, kontributor, ...). super_admin tidak pernah
    // diberikan otomatis kecuali dipetakan eksplisit di sini.
    'peta_peran' => $petaPeran,

    // Alamat SPA tujuan setelah callback. Bawaan: FRONTEND_URL pertama, atau APP_URL.
    'frontend_url' => rtrim((string) (env('SSO_PORTAL_FRONTEND_URL')
        ?: (trim(explode(',', (string) env('FRONTEND_URL', ''))[0]) ?: env('APP_URL', ''))), '/'),
];
