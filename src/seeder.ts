import {PoolConnection} from "mariadb";
import {
  generateDokter,
  generateLampiran,
  generateMahasiswa,
  generatePanitia, generatePenerimaBeasiswa,
  generatePengawas, generatePewawancara, generatePsikotes, generateSeleksi, generateSeleksiKesehatan, generateWawancara,
  jenisLampiran, jenisSeleksi
} from "./faker";
import {faker} from "@faker-js/faker";

export const seedTidakLulusAdministrasi = async (conn: PoolConnection) => {
  /**
   * Generate mahasiswa yang tidak lulus administrasi sebanyak 20 orang
   */

  for (let i = 0; i < 20; i++) {
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

    const lampiranCount = Math.random() - 0.5 > 0 ? 1 : 2

    faker.helpers.arrayElements(jenisLampiran, lampiranCount).forEach(jenis => {
      const lampiran = generateLampiran()
      conn.query(`INSERT INTO lampiran(link_file, jenis_lampiran, nama_file, tanggal_unggah_file,
                                       id_mahasiswa) VALUE (?, ?, ?, ?, ?)`,
          [
            lampiran.link_file,
            jenis,
            lampiran.nama_file,
            lampiran.tanggal_unggah_file,
            id_mahasiswa
          ]).catch(e => console.log(e))
    })
  }
}

const seedWawancara = async (conn: PoolConnection, id_mahasiswa: number, pass: boolean) => {
  const pewawancara = await conn.query(`SELECT id_pewawancara
                                        from pewawancara`) as { id_pewawancara: number }[]
  const wawancara = generateWawancara(pass)

  const seleksi = generateSeleksi()

  const res = await conn.query(`INSERT INTO seleksi(tanggal_seleksi, jenis_seleksi) VALUE (?, ?)`, [
    seleksi.tanggal_seleksi,
    'wawancara'
  ])

  const id_seleksi = res.insertId as number

  await conn.query(`INSERT INTO wawancara(id_wawancara, jenis_wawancara, sesi_wawancara, id_mahasiswa, nilai) VALUE (?, ?, ?, ?, ?)`, [
    id_seleksi,
    wawancara.jenis_wawancara,
    wawancara.sesi_wawancara,
    id_mahasiswa,
    wawancara.nilai
  ])

  const numOfWawancara = faker.datatype.number({min: 2, max: 5})

  faker.helpers.arrayElements(pewawancara, numOfWawancara).forEach(pewawan => {
    conn.query(`INSERT INTO mewawancara(id_wawancara, id_pewawancara) VALUE (?, ?)`, [
      id_seleksi,
      pewawan.id_pewawancara
    ]).catch(e => console.log(e))
  })
}

const seedSeleksiKesehatan = async (conn: PoolConnection, id_mahasiswa: number, pass: boolean) => {
  const dokter = await conn.query(`SELECT id_dokter
                                   from dokter`) as { id_dokter: number }[]
  const kesehatan = generateSeleksiKesehatan(pass)

  const seleksi = generateSeleksi()

  const res = await conn.query(`INSERT INTO seleksi(tanggal_seleksi, jenis_seleksi) VALUE (?, ?)`, [
    seleksi.tanggal_seleksi,
    'wawancara'
  ])

  const id_seleksi = res.insertId as number

  await conn.query(`INSERT INTO seleksi_kesehatan(id_kesehatan, nama_rumah_sakit,
                                                  kota_rumah_sakit, id_mahasiswa, id_dokter,
                                                  nilai) VALUE (?, ?, ?, ?, ?, ?)`, [
    id_seleksi,
    kesehatan.nama_rumah_sakit,
    kesehatan.kota_rumah_sakit,
    id_mahasiswa,
    faker.helpers.arrayElement(dokter).id_dokter,
    kesehatan.nilai
  ])
}

const seedPsikotes = async (conn: PoolConnection, id_mahasiswa: number, pass: boolean) => {

  const pengawas = await conn.query(`SELECT id_pengawas
                                     from pengawas`) as { id_pengawas: number }[]
  const psikotes = generatePsikotes(pass)

  const seleksi = generateSeleksi()

  const res = await conn.query(`INSERT INTO seleksi(tanggal_seleksi, jenis_seleksi) VALUE (?, ?)`, [
    seleksi.tanggal_seleksi,
    'wawancara'
  ])

  const id_seleksi = res.insertId as number

  await conn.query(`INSERT INTO psikotes(id_psikotes, sesi_psikotes,
                                         ruangan_psikotes, id_mahasiswa, id_pengawas,
                                         nilai) VALUE (?, ?, ?, ?, ?, ?)`, [
    id_seleksi,
    psikotes.sesi_psikotes,
    psikotes.ruangan_psikotes,
    id_mahasiswa,
    faker.helpers.arrayElement(pengawas).id_pengawas,
    psikotes.nilai
  ])
}

export const seedPanitia = async (conn: PoolConnection) => {
  /**
   * 60 panitia,
   * 20 dokter
   * 20 pengawas,
   * 20 pewawancara
   */

  for (let i = 0; i < 60; i++) {
    const panitia = generatePanitia()
    const res = await conn.query(`INSERT INTO panitia(nama_lengkap_panitia) VALUE (?)`, [
      panitia.nama_lengkap_panitia
    ])
    const id_panitia = res.insertId as number

    if (i % 3 === 0) {
      const dokter = generateDokter()
      await conn.query(`INSERT INTO dokter(id_dokter, spesialis) VALUE (?, ?)`, [
        id_panitia, dokter.spesialis
      ])
    } else if (i % 3 === 1) {
      const pengawas = generatePengawas()
      await conn.query(`INSERT INTO pengawas(id_pengawas, divisi) VALUE (?, ?)`, [
        id_panitia, pengawas.divisi
      ])
    } else {
      const pewawancara = generatePewawancara()
      await conn.query(`INSERT INTO pewawancara(id_pewawancara, jabatan) VALUE (?, ?)`, [
        id_panitia, pewawancara.jabatan
      ])
    }
  }
}

export const seedTidakLulusSeleksi = async (conn: PoolConnection) => {
  /**
   * Generate mahasiswa yang tidak lulus seleksi sebanyak 90 orang
   * 30 tidak lulus satu pun
   * 30 hanya lulus satu
   * 30 hanya lulus dua
   */

  for (let i = 0; i < 90; i++) {
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
      conn.query(`INSERT INTO lampiran(link_file, jenis_lampiran, nama_file, tanggal_unggah_file,
                                       id_mahasiswa) VALUE (?, ?, ?, ?, ?)`,
          [
            lampiran.link_file,
            jenis,
            lampiran.nama_file,
            lampiran.tanggal_unggah_file,
            id_mahasiswa
          ]).catch(e => console.log(e))
    })

    if (i % 3 === 0) {
      await seedPsikotes(conn, id_mahasiswa, false)
      await seedSeleksiKesehatan(conn, id_mahasiswa, false)
      await seedWawancara(conn, id_mahasiswa, false)
    } else if (i % 3 === 1) {
      const passes = [false, false, true].sort((a, b) => 0.5 - Math.random())
      await seedPsikotes(conn, id_mahasiswa, passes[0])
      await seedSeleksiKesehatan(conn, id_mahasiswa, passes[1])
      await seedWawancara(conn, id_mahasiswa, passes[2])
    } else {
      const passes = [false, true, true].sort((a, b) => 0.5 - Math.random())
      await seedPsikotes(conn, id_mahasiswa, passes[0])
      await seedSeleksiKesehatan(conn, id_mahasiswa, passes[1])
      await seedWawancara(conn, id_mahasiswa, passes[2])
    }
  }
}

export const seedLulusSeleksi = async (conn: PoolConnection) => {
  /**
   * Generate mahasiswa yang lulus seleksi sebanyak 20 orang
   */

  for (let i = 0; i < 20; i++) {
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
      conn.query(`INSERT INTO lampiran(link_file, jenis_lampiran, nama_file, tanggal_unggah_file,
                                       id_mahasiswa) VALUE (?, ?, ?, ?, ?)`,
          [
            lampiran.link_file,
            jenis,
            lampiran.nama_file,
            lampiran.tanggal_unggah_file,
            id_mahasiswa
          ]).catch(e => console.log(e))
    })

    await seedPsikotes(conn, id_mahasiswa, true)
    await seedSeleksiKesehatan(conn, id_mahasiswa, true)
    await seedWawancara(conn, id_mahasiswa, true)

    const beasiswa = generatePenerimaBeasiswa()

    await conn.query(`INSERT INTO penerima_beasiswa(id_penerima, program_studi, universitas_tujuan, jumlah_dana) VALUE (?, ?, ?, ?)`, [
      id_mahasiswa,
      beasiswa.program_studi,
      beasiswa.universitas_tujuan,
      beasiswa.jumlah_dana
    ])
  }
}

export const seedJenisSeleksi = async (conn: PoolConnection) => {
  await conn.query(`INSERT INTO jenis_seleksi(jenis_seleksi, passing_grade) VALUE (?, ?)`, [
    'psikotes',
    80
  ])

  await conn.query(`INSERT INTO jenis_seleksi(jenis_seleksi, passing_grade) VALUE (?, ?)`, [
    'kesehatan',
    85
  ])

  await conn.query(`INSERT INTO jenis_seleksi(jenis_seleksi, passing_grade) VALUE (?, ?)`, [
    'wawancara',
    80
  ])
}