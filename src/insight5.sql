WITH jumlah_pewawancara AS (SELECT COUNT(*) as count, mewawancara.id_wawancara
                            FROM mewawancara
                                     INNER JOIN wawancara w on mewawancara.id_wawancara = w.id_wawancara
                                     INNER JOIN penerima_beasiswa on penerima_beasiswa.id_penerima = w.id_mahasiswa
                            GROUP BY id_wawancara)
SELECT AVG(count) as rerata, MIN(count) as minimal, MAX(count) as maksimal
FROM jumlah_pewawancara;