import {createPool, PoolConnection} from 'mariadb'
import {
  seedJenisSeleksi,
  seedLulusSeleksi,
  seedPanitia,
  seedTidakLulusAdministrasi,
  seedTidakLulusSeleksi
} from "./seeder";

const pool = createPool({
  host: 'localhost',
  user: 'basdat',
  port: 3306,
  password: 'basdat',
  database: 'basdat'
})


async function mainSeeder() {
  let conn: PoolConnection | null = null

  try {
    conn = await pool.getConnection()

    console.log('Seeding tidak lulus administrasi')
    await seedTidakLulusAdministrasi(conn)
    console.log('Seeding panitia')
    await seedPanitia(conn)
    console.log('Seeding jenis seleksi')
    await seedJenisSeleksi(conn)
    console.log('Seeding tidak lulus seleksi')
    await seedTidakLulusSeleksi(conn)
    console.log('seeding lulus seleksi')
    await seedLulusSeleksi(conn)
    console.log('Done')
  } finally {
    if (conn) {
      await conn.release()
    }
  }
}

mainSeeder().catch(e => console.log(e))