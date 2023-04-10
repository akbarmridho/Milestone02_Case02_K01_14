WITH mahasiswa_gagal_psikotes AS (
    SELECT id_mahasiswa
    FROM seleksi
             INNER JOIN jenis_seleksi js on seleksi.jenis_seleksi = js.jenis_seleksi
             INNER JOIN psikotes p on seleksi.id_seleksi = p.id_psikotes
    WHERE nilai < passing_grade
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
SELECT mahasiswa.id_mahasiswa, nama_lengkap_mahasiswa, nilai as nilai_psikotes
FROM mahasiswa_gagal_psikotes
         INNER JOIN mahasiswa on mahasiswa_gagal_psikotes.id_mahasiswa = mahasiswa.id_mahasiswa
         INNER JOIN psikotes p2 on mahasiswa.id_mahasiswa = p2.id_mahasiswa;