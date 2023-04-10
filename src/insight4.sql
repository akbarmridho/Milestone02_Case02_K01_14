SELECT AVG(TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE())) as rerata_umur
FROM mahasiswa
         INNER JOIN penerima_beasiswa pb on mahasiswa.id_mahasiswa = pb.id_penerima;