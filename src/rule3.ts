import {createPool, PoolConnection} from 'mariadb'
import {
  seedJenisSeleksi,
  seedLulusSeleksi,
  seedPanitia, seedPsikotes, seedSeleksiKesehatan,
  seedTidakLulusAdministrasi,
  seedTidakLulusSeleksi, seedWawancara
} from "./seeder";
import {generateLampiran, generateMahasiswa, jenisLampiran} from "./faker";

const pool = createPool({
  host: 'localhost',
  user: 'basdat',
  port: 3306,
  password: 'basdat',
  database: 'basdat'
})


async function rule3Tester() {
  let conn: PoolConnection | null = null

  try {
    conn = await pool.getConnection()

    console.log('Membuat data mahasiswa')
    const mahasiswa = generateMahasiswa()
    const res = await conn.query(`INSERT INTO mahasiswa(nama_lengkap_mahasiswa,
                                                        jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon,
                                                        email)
                                  VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      mahasiswa.nama_lengkap_mahasiswa,
      mahasiswa.jenis_kelamin,
      mahasiswa.tempat_lahir,
      mahasiswa.tanggal_lahir,
      mahasiswa.alamat,
      mahasiswa.no_telepon,
      mahasiswa.email
    ])

    const id_mahasiswa = res.insertId as number

    jenisLampiran.forEach(jenis => {
      const lampiran = generateLampiran()
      conn!.query(`INSERT INTO lampiran(link_file, jenis_lampiran, nama_file, tanggal_unggah_file,
                                       id_mahasiswa) VALUE (?, ?, ?, ?, ?)`,
          [
            lampiran.link_file,
            jenis,
            lampiran.nama_file,
            lampiran.tanggal_unggah_file,
            id_mahasiswa
          ]).catch(e => console.log(e))
    })

    console.log('Memasukkan data psikotes sebelum wawancara')

    try {
      await conn.beginTransaction()

      await seedPsikotes(conn, id_mahasiswa, true);

      await conn.commit()
    } catch (e) {
      console.log((e as any).sql)
      console.log((e as any).text)
      await conn.rollback()
    }

    console.log('Memasukkan data wawancara')
    await seedWawancara(conn, id_mahasiswa, true)

    console.log('Memasukkan data seleksi kesehatan sebelum psikotes')
    try {
      await conn.beginTransaction()

      await seedSeleksiKesehatan(conn, id_mahasiswa, true)

      await conn.commit()
    } catch (e) {
      console.log((e as any).sql)
      console.log((e as any).text)
      await conn.rollback()
    }

    console.log('Memasukkan data seleksi psikotes')
    await seedPsikotes(conn, id_mahasiswa, true)

    console.log('Memasukkan data seleksi kesehatan')
    await seedSeleksiKesehatan(conn, id_mahasiswa, true)


    console.log('Memasukkan data wawancara (DUPLIKAT)')

    try {
      await conn.beginTransaction()

      await seedWawancara(conn, id_mahasiswa, true)

      await conn.commit()
    } catch (e) {
      console.log((e as any).sql)
      console.log((e as any).text)
      await conn.rollback()
    }

    console.log('Memasukkan data seleksi psikotes (DUPLIKAT)')
    try {
      await conn.beginTransaction()

      await seedPsikotes(conn, id_mahasiswa, true)

      await conn.commit()
    } catch (e) {
      console.log((e as any).sql)
      console.log((e as any).text)
      await conn.rollback()
    }

    console.log('Memasukkan data seleksi kesehatan (DUPLIKAT)')
    try {
      await conn.beginTransaction()

      await seedSeleksiKesehatan(conn, id_mahasiswa, true)

      await conn.commit()
    } catch (e) {
      console.log((e as any).sql)
      console.log((e as any).text)
      await conn.rollback()
    }

  } catch (e) {

  } finally {
    if (conn != null) {
      await conn.release()
    }
  }
}

rule3Tester().catch(e => console.log(e))