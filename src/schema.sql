CREATE TABLE mahasiswa (
    id_mahasiswa int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nama_lengkap_mahasiswa varchar(255) not null,
    jenis_kelamin enum('male', 'female'),
    tempat_lahir varchar(255),
    tanggal_lahir date,
    alamat varchar(255),
    no_telepon varchar(255),
    email varchar(255)
);

CREATE TABLE lampiran (
    id_lampiran int PRIMARY KEY AUTO_INCREMENT,
    link_file varchar(255) unique,
    jenis_lampiran varchar(255),
    nama_file varchar(255),
    tanggal_unggah_file date,
    id_mahasiswa int,
    FOREIGN KEY (id_mahasiswa) references mahasiswa(id_mahasiswa)
);

CREATE TABLE jenis_seleksi (
   jenis_seleksi enum('psikotes', 'kesehatan', 'wawancara') PRIMARY KEY,
   passing_grade float unsigned check ( passing_grade between 0 and 100)
);

CREATE TABLE seleksi (
    id_seleksi int PRIMARY KEY AUTO_INCREMENT,
    tanggal_seleksi date,
    jenis_seleksi enum('psikotes', 'kesehatan', 'wawancara'),
    FOREIGN KEY (jenis_seleksi) references jenis_seleksi(jenis_seleksi)
);

CREATE TABLE panitia (
    id_panitia int PRIMARY KEY AUTO_INCREMENT,
    nama_lengkap_panitia varchar(255)
);

CREATE TABLE penerima_beasiswa (
    id_penerima int PRIMARY KEY,
    program_studi varchar(255),
    universitas_tujuan varchar(255),
    jumlah_dana int,
    FOREIGN KEY (id_penerima) references mahasiswa(id_mahasiswa)
);

CREATE TABLE pewawancara (
    id_pewawancara int PRIMARY KEY ,
    jabatan varchar(255),
    FOREIGN KEY (id_pewawancara) references panitia(id_panitia)
);

CREATE TABLE wawancara (
    id_wawancara int PRIMARY KEY,
    jenis_wawancara varchar(255),
    sesi_wawancara varchar(255),
    id_mahasiswa int,
    nilai int unsigned check ( nilai between 0 and 100),
    FOREIGN KEY (id_wawancara) references seleksi(id_seleksi),
    FOREIGN KEY (id_mahasiswa) references mahasiswa(id_mahasiswa)
);

CREATE TABLE mewawancara (
    id_wawancara int,
    id_pewawancara int,
    PRIMARY KEY (id_pewawancara, id_wawancara),
    FOREIGN KEY (id_pewawancara) references pewawancara(id_pewawancara),
    FOREIGN KEY (id_wawancara) references wawancara(id_wawancara)
);

CREATE TABLE dokter (
    id_dokter int PRIMARY KEY,
    spesialis varchar(255),
    FOREIGN KEY (id_dokter) references panitia(id_panitia)
);

CREATE TABLE seleksi_kesehatan (
    id_kesehatan int PRIMARY KEY,
    nama_rumah_sakit varchar(255),
    kota_rumah_sakit varchar(255),
    id_mahasiswa int,
    id_dokter int,
    nilai int unsigned check ( nilai between 0 and 100),
    FOREIGN KEY (id_kesehatan) references seleksi(id_seleksi),
    FOREIGN KEY (id_mahasiswa) references mahasiswa(id_mahasiswa),
    FOREIGN KEY (id_dokter) references dokter(id_dokter)
);

CREATE TABLE pengawas (
    id_pengawas int PRIMARY KEY,
    divisi varchar(255),
    FOREIGN KEY (id_pengawas) references panitia(id_panitia)
);

CREATE TABLE psikotes (
    id_psikotes int PRIMARY KEY,
    sesi_psikotes varchar(255),
    ruangan_psikotes varchar(255),
    id_mahasiswa int,
    id_pengawas int,
    nilai int unsigned check ( nilai between 0 and 100),
    FOREIGN KEY (id_psikotes) references seleksi(id_seleksi),
    FOREIGN KEY (id_mahasiswa) references mahasiswa(id_mahasiswa),
    FOREIGN KEY (id_pengawas) references pengawas(id_pengawas)
);

ALTER TABLE wawancara ADD CONSTRAINT wawancara_mahasiswa_unique UNIQUE (id_mahasiswa);

ALTER TABLE psikotes ADD CONSTRAINT psikotes_mahasiswa_unique UNIQUE (id_mahasiswa);

ALTER TABLE seleksi_kesehatan ADD CONSTRAINT seleksi_kesehatan_mahasiswa_unique UNIQUE (id_mahasiswa);

CREATE TRIGGER check_has_wawancara BEFORE INSERT ON psikotes
    FOR EACH ROW
    BEGIN
        DECLARE wawancara_count INT;

        SELECT COUNT(*)
            INTO wawancara_count
        FROM wawancara
            WHERE wawancara.id_mahasiswa = NEW.id_mahasiswa;

        IF wawancara_count != 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'mahasiswa harus melalui tahap wawancara terlebih dahulu';
        END IF;
    END;

CREATE TRIGGER check_has_psikotes BEFORE INSERT ON seleksi_kesehatan
    FOR EACH ROW
BEGIN
    DECLARE psikotes_count INT;

    SELECT COUNT(*)
    INTO psikotes_count
    FROM psikotes
    WHERE psikotes.id_mahasiswa = NEW.id_mahasiswa;

    IF psikotes_count != 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'mahasiswa harus melalui tahap psikotes terlebih dahulu';
    END IF;
END;

CREATE VIEW data_kelulusan_seleksi AS (
    SELECT "Seleksi Dokumen" AS jenis_seleksi, 
        COUNT(distinct id_mahasiswa) AS total, 
        'null' AS nilai_avg, 
        'null' AS nilai_max, 
        'null' AS nilai_min 
    FROM lampiran 
    WHERE id_mahasiswa IN (
        SELECT id_mahasiswa 
        FROM lampiran 
        GROUP BY id_mahasiswa 
        HAVING COUNT(id_lampiran) = 3
    )
) 
UNION (
    SELECT "Seleksi Wawancara" AS jenis_seleksi,
        COUNT(id_mahasiswa) AS total, 
        AVG(nilai) AS nilai_avg, 
        MAX(nilai) AS nilai_max, 
        MIN(nilai) AS nilai_min 
    FROM wawancara, jenis_seleksi 
    WHERE jenis_seleksi = 'wawancara' 
        AND nilai >= passing_grade
) 
UNION (
    SELECT "Seleksi Psikotes" AS jenis_seleksi,
        COUNT(id_mahasiswa) AS total, 
        AVG(nilai) AS nilai_avg, 
        MAX(nilai) AS nilai_max, 
        MIN(nilai) AS nilai_min 
    FROM psikotes, jenis_seleksi 
    WHERE jenis_seleksi = 'psikotes' 
        AND nilai >= passing_grade
) 
UNION ( 
    SELECT "Seleksi Kesehatan" AS jenis_seleksi,
        COUNT(id_mahasiswa) AS total, 
        AVG(nilai) AS nilai_avg, 
        MAX(nilai) as nilai_max, 
        MIN(nilai) as nilai_min 
    FROM seleksi_kesehatan, jenis_seleksi 
    WHERE jenis_seleksi = 'kesehatan' 
        AND nilai >= passing_grade
);

CREATE TRIGGER update_passing_grade_psikotes_i AFTER INSERT ON psikotes
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM psikotes) WHERE jenis_seleksi = 'psikotes';
    
CREATE TRIGGER update_passing_grade_psikotes_u AFTER UPDATE ON psikotes
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM psikotes) WHERE jenis_seleksi = 'psikotes';
    
CREATE TRIGGER update_passing_grade_psikotes_d AFTER DELETE ON psikotes
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM psikotes) WHERE jenis_seleksi = 'psikotes';
    

CREATE TRIGGER update_passing_grade_seleksi_kesehatan_i AFTER INSERT ON seleksi_kesehatan
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM seleksi_kesehatan) WHERE jenis_seleksi = 'kesehatan';

CREATE TRIGGER update_passing_grade_seleksi_kesehatan_u AFTER UPDATE ON seleksi_kesehatan
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM seleksi_kesehatan) WHERE jenis_seleksi = 'kesehatan';

CREATE TRIGGER update_passing_grade_seleksi_kesehatan_d AFTER DELETE ON seleksi_kesehatan
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM seleksi_kesehatan) WHERE jenis_seleksi = 'kesehatan';
    

CREATE TRIGGER update_passing_grade_wawancara_i AFTER INSERT ON wawancara
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM wawancara) WHERE jenis_seleksi = 'wawancara';

CREATE TRIGGER update_passing_grade_wawancara_U AFTER UPDATE ON wawancara
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM wawancara) WHERE jenis_seleksi = 'wawancara';

CREATE TRIGGER update_passing_grade_wawancara_d AFTER DELETE ON wawancara
    FOR EACH ROW
    UPDATE jenis_seleksi SET passing_grade = (SELECT AVG(nilai) FROM wawancara) WHERE jenis_seleksi = 'wawancara';
