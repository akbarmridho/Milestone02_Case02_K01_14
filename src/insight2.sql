WITH mahasiswa_lulus AS (
    SELECT id_mahasiswa
    FROM seleksi
             INNER JOIN jenis_seleksi js on seleksi.jenis_seleksi = js.jenis_seleksi
             INNER JOIN psikotes p on seleksi.id_seleksi = p.id_psikotes
    WHERE nilai >= passing_grade
        intersect
        SELECT id_mahasiswa
        FROM seleksi
                 INNER JOIN jenis_seleksi js on seleksi.jenis_seleksi = js.jenis_seleksi
                 INNER JOIN seleksi_kesehatan sk on seleksi.id_seleksi = sk.id_kesehatan
        WHERE nilai >= passing_grade
        intersect
        SELECT id_mahasiswa
        FROM seleksi
                 INNER JOIN jenis_seleksi js on seleksi.jenis_seleksi = js.jenis_seleksi
                 INNER JOIN wawancara w on seleksi.id_seleksi = w.id_wawancara
        WHERE nilai >= passing_grade)
SELECT AVG(nilai) as rerata_wawancara
FROM mahasiswa_lulus
         INNER JOIN wawancara on wawancara.id_mahasiswa = mahasiswa_lulus.id_mahasiswa;