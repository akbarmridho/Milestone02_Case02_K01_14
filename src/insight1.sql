SELECT lampiran.id_mahasiswa, nama_lengkap_mahasiswa, count(lampiran.id_mahasiswa) as banyak_lampiran
FROM mahasiswa
         INNER JOIN lampiran
                    ON mahasiswa.id_mahasiswa = lampiran.id_mahasiswa
GROUP BY mahasiswa.id_mahasiswa
HAVING count(lampiran.id_mahasiswa) < 3;