import {faker} from "@faker-js/faker";

export const generateMahasiswa = () => {
  const sex = faker.name.sexType()
  const firstName = faker.name.firstName(sex)
  const lastName = faker.name.lastName()
  const email = faker.helpers.unique(faker.internet.email, [
    firstName,
    lastName
  ])

  return {
    nama_lengkap_mahasiswa: `${firstName} ${lastName}`,
    jenis_kelamin: sex,
    tempat_lahir: faker.address.city(),
    tanggal_lahir: faker.date.birthdate({min: 18, max: 25, mode: 'age'}),
    alamat: faker.address.streetAddress(),
    no_telepon: faker.phone.number('628###########'),
    email: email
  }
}

const programStudi = [
  'Artificial Intelligence',
  'Data Science',
  'Robotics',
  'Biomedical Engineering',
  'Epidemiology',
  'Virology',
  'Cybersecurity'
]

const universities = [
  'Boston University',
  'University of Pennyslavia',
  'Nanyang Technological University',
  'National Taiwan University',
  'Osaka University',
  'Hanyang University',
  'Universiti Malaya',
  'Universitas Sains Malaya',
  'The University of Western Australia',
  'Oxford University',
  'Cambridge University'
]

export const generatePenerimaBeasiswa = () => {
  return {
    program_studi: faker.helpers.arrayElement(programStudi),
    universitas_tujuan: faker.helpers.arrayElement(universities),
    jumlah_dana: faker.datatype.number({min: 5, max: 20}) * 20000000
  }
}

export const jenisLampiran = [
  'ijazah s1',
  'transkrip nilai',
  'surat rekomendasi dosen'
]

export const generateLampiran = () => {
  return {
    link_file: faker.helpers.unique(faker.internet.url),
    nama_file: faker.system.commonFileName('pdf'),
    tanggal_unggah_file: faker.date.recent(60)
  }
}

export const generatePanitia = () => {
  const sex = faker.name.sexType()
  const firstName = faker.name.firstName(sex)
  const lastName = faker.name.lastName()
  return {
    nama_lengkap_panitia: `${firstName} ${lastName}`
  }
}

export const generateDokter = () => {
  return {
    spesialis: faker.helpers.arrayElement([
      'Spesialis Jiwa',
      'Umum',
      'Kedokteran Olahraga'
    ])
  }
}

export const generatePengawas = () => {
  return {
    divisi: faker.helpers.arrayElement([
      'Psikolog',
      'Umum',
      'Asisten',
      'Mahasiswa Psikologi',
      'Psikiater',
      'Pengawas Utama'
    ])
  }
}

export const generatePewawancara = () => {
  return {
    jabatan: faker.name.jobTitle()
  }
}

export const jenisSeleksi = [
  'psikotes',
  'kesehatan',
  'wawancara'
]

export const generateSeleksi = () => {
  return {
    tanggal_seleksi: faker.date.recent(30)
  }
}

export const generateWawancara = (pass: boolean) => {
  return {
    jenis_wawancara: faker.helpers.arrayElement(['online', 'offline']),
    sesi_wawancara: faker.helpers.arrayElement(['Pagi', 'Siang', 'Sore']),
    nilai: pass ? faker.datatype.number({min: 80, max: 95}) : faker.datatype.number({min: 40, max: 79})
  }
}

export const generateSeleksiKesehatan = (pass: boolean) => {
  return {
    nama_rumah_sakit: faker.company.name(),
    kota_rumah_sakit: faker.address.city(),
    nilai: pass ? faker.datatype.number({min: 85, max: 95}) : faker.datatype.number({min: 70, max: 84})
  }
}

export const generatePsikotes = (pass: boolean) => {
  return {
    sesi_psikotes: faker.helpers.arrayElement(['Pagi', 'Siang', 'Sore']),
    ruangan_psikotes: faker.address.buildingNumber(),
    nilai: pass ? faker.datatype.number({min: 80, max: 95}) : faker.datatype.number({min: 60, max: 79})
  }
}