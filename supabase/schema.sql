-- ==============================================================================
-- SKEMA SUPABASE: api-wilayah (Schema: wilayah)
-- ==============================================================================
-- Skema ini terisolasi dari schema 'public' aplikasi lain Anda di Supabase.

-- 1. Buat Schema Khusus
CREATE SCHEMA IF NOT EXISTS wilayah;

-- 2. Buat Tabel Utama
CREATE TABLE IF NOT EXISTS wilayah.wilayah (
    kode VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    tipe VARCHAR(20) NOT NULL,
    kodepos VARCHAR(10)
);

-- 3. Buat Index untuk Performa Tinggi
CREATE INDEX IF NOT EXISTS idx_wilayah_tipe ON wilayah.wilayah (tipe);
CREATE INDEX IF NOT EXISTS idx_wilayah_kodepos ON wilayah.wilayah (kodepos);
CREATE INDEX IF NOT EXISTS idx_wilayah_length ON wilayah.wilayah (length(kode));
CREATE INDEX IF NOT EXISTS idx_wilayah_kode_pattern ON wilayah.wilayah (kode varchar_pattern_ops);

-- 4. Buat Views Pendukung API PostgREST

-- 4.1 View Provinsi
CREATE OR REPLACE VIEW wilayah.v_provinsi 
WITH (security_invoker = on) AS
SELECT 
    kode, 
    nama, 
    tipe
FROM wilayah.wilayah
WHERE length(kode) = 2
ORDER BY kode;

-- 4.2 View Kabupaten / Kota
CREATE OR REPLACE VIEW wilayah.v_kabupaten 
WITH (security_invoker = on) AS
SELECT 
    p.nama AS nama_provinsi,
    k.kode, 
    k.nama, 
    k.tipe
FROM wilayah.wilayah k
LEFT JOIN wilayah.wilayah p ON p.kode = substr(k.kode, 1, 2)
WHERE length(k.kode) = 5
ORDER BY k.kode;

-- 4.3 View Kecamatan
CREATE OR REPLACE VIEW wilayah.v_kecamatan 
WITH (security_invoker = on) AS
SELECT 
    p.nama AS nama_provinsi,
    kab.nama AS nama_kabupaten,
    k.kode, 
    k.nama, 
    k.tipe
FROM wilayah.wilayah k
LEFT JOIN wilayah.wilayah p ON p.kode = substr(k.kode, 1, 2)
LEFT JOIN wilayah.wilayah kab ON kab.kode = substr(k.kode, 1, 5)
WHERE length(k.kode) = 8
ORDER BY k.kode;

-- 4.4 View Desa / Kelurahan
CREATE OR REPLACE VIEW wilayah.v_desa 
WITH (security_invoker = on) AS
SELECT 
    p.nama AS nama_provinsi,
    kab.nama AS nama_kabupaten,
    kec.nama AS nama_kecamatan,
    d.kode, 
    d.nama, 
    d.tipe, 
    d.kodepos
FROM wilayah.wilayah d
LEFT JOIN wilayah.wilayah p ON p.kode = substr(d.kode, 1, 2)
LEFT JOIN wilayah.wilayah kab ON kab.kode = substr(d.kode, 1, 5)
LEFT JOIN wilayah.wilayah kec ON kec.kode = substr(d.kode, 1, 8)
WHERE length(d.kode) = 13
ORDER BY d.kode;

-- 4.5 View Detail Lengkap
CREATE OR REPLACE VIEW wilayah.v_detail 
WITH (security_invoker = on) AS
SELECT 
    p.nama AS nama_provinsi,
    kab.nama AS nama_kabupaten,
    kec.nama AS nama_kecamatan,
    w.kode, 
    w.nama, 
    w.tipe, 
    w.kodepos
FROM wilayah.wilayah w
LEFT JOIN wilayah.wilayah p ON p.kode = substr(w.kode, 1, 2) AND length(w.kode) > 2
LEFT JOIN wilayah.wilayah kab ON kab.kode = substr(w.kode, 1, 5) AND length(w.kode) > 5
LEFT JOIN wilayah.wilayah kec ON kec.kode = substr(w.kode, 1, 8) AND length(w.kode) > 8;

-- 4.6 View Rekapitulasi per Provinsi
CREATE OR REPLACE VIEW wilayah.v_rekapitulasi 
WITH (security_invoker = on) AS
SELECT 
    p.kode AS provinsi_kode,
    p.nama AS provinsi_nama,
    COALESCE(r.kabupaten, 0)::int AS kabupaten,
    COALESCE(r.kota, 0)::int AS kota,
    COALESCE(r.kecamatan, 0)::int AS kecamatan,
    COALESCE(r.kelurahan, 0)::int AS kelurahan,
    COALESCE(r.desa, 0)::int AS desa
FROM wilayah.wilayah p
LEFT JOIN (
    SELECT 
        substr(kode, 1, 2) AS prov_kode,
        SUM(CASE WHEN length(kode) = 5 AND CAST(substr(kode, 4, 2) AS INTEGER) < 70 THEN 1 ELSE 0 END) AS kabupaten,
        SUM(CASE WHEN length(kode) = 5 AND CAST(substr(kode, 4, 2) AS INTEGER) >= 70 THEN 1 ELSE 0 END) AS kota,
        SUM(CASE WHEN length(kode) = 8 THEN 1 ELSE 0 END) AS kecamatan,
        SUM(CASE WHEN length(kode) = 13 AND CAST(substr(kode, 10, 1) AS INTEGER) = 1 THEN 1 ELSE 0 END) AS kelurahan,
        SUM(CASE WHEN length(kode) = 13 AND CAST(substr(kode, 10, 1) AS INTEGER) <> 1 THEN 1 ELSE 0 END) AS desa
    FROM wilayah.wilayah
    WHERE length(kode) > 2
    GROUP BY substr(kode, 1, 2)
) r ON p.kode = r.prov_kode
WHERE length(p.kode) = 2
ORDER BY p.kode;

-- 4.7 View Statistik Keseluruhan
CREATE OR REPLACE VIEW wilayah.v_stats 
WITH (security_invoker = on) AS
SELECT 
    length(kode) AS len, 
    tipe, 
    count(*)::int AS count
FROM wilayah.wilayah
GROUP BY length(kode), tipe;

-- 5. Hak Akses (Permissions & Roles)
GRANT USAGE ON SCHEMA wilayah TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA wilayah TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA wilayah TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA wilayah GRANT SELECT ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA wilayah GRANT ALL ON TABLES TO service_role;

-- 6. Row Level Security (RLS)
ALTER TABLE wilayah.wilayah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Only" ON wilayah.wilayah;
CREATE POLICY "Public Read Only" ON wilayah.wilayah
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Service Role Full Access" ON wilayah.wilayah;
CREATE POLICY "Service Role Full Access" ON wilayah.wilayah
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
