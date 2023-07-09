const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
const cors = require ("cors")

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin:"*"
}));
// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload
 
//=================== 17 maret 2023 == Penjelasan teori
 

// create data / insert data
app.post('/api/tiket_konser',upload.single('image'),(req, res) => {


    const data = { ...req.body };
    const id_tiket = req.body.id_tiket;
    const nama_pemesan = req.body.nama_pemesan;
    const alamat_pemesan= req.body.alamat_pemesan;
    const tanggal_pemesan = req.body.tanggal_pemesan;
    const jenis_tiket = req.body.jenis_tiket;
    const tanggal_konser = req.body.tanggal_konser;
    const foto = req.body.foto;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO tiket_konser (id_tiket,nama_pemesan,alamat_pemesan,tanggal_pemesan,jenis_tiket,tanggal_konser,foto) values (?,?,?,?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ id_tiket,nama_pemesan,alamat_pemesan,tanggal_pemesan,jenis_tiket,tanggal_konser,foto], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO tiket_konser (id_tiket,nama_pemesan,alamat_pemesan,tanggal_pemesan,jenis_tiket,tanggal_konser,foto) values (?,?,?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ id_tiket,nama_pemesan,alamat_pemesan,tanggal_pemesan,jenis_tiket,tanggal_konser,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/tiket_konser', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM tiket_konser';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/tiket_konser/:id_tiket', (req, res) => {
  const id_tiket = req.params.id_tiket;
  const { nama_pemesan, alamat_pemesan, tanggal_pemesan, jenis_tiket, tanggal_konser } = req.body;

  const querySearch = 'SELECT * FROM tiket_konser WHERE id_tiket = ?';
  const queryUpdate = 'UPDATE tiket_konser SET nama_pemesan = ?, alamat_pemesan = ?, tanggal_pemesan = ?, jenis_tiket = ?, tanggal_konser = ? WHERE id_tiket = ?';

  // Execute the search query to check if the data exists
  koneksi.query(querySearch, [id_tiket], (err, rows) => {
    // Error handling
    if (err) {
      return res.status(500).json({ message: 'Ada kesalahan', error: err });
    }

    // Check if the data with the specified ID exists
    if (rows.length) {
      // Execute the update query
      koneksi.query(
        queryUpdate,
        [nama_pemesan, alamat_pemesan, tanggal_pemesan, jenis_tiket, tanggal_konser, id_tiket],
        (err, result) => {
          // Error handling
          if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
          }

          // Check if the update was successful
          if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Berhasil update data!' });
          } else {
            res.status(500).json({ success: false, message: 'Gagal update data!' });
          }
        }
      );
    } else {
      res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
    }
  });
});


// delete data
app.delete('/api/tiket_konser/:id_tiket', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM tiket_konser WHERE id_tiket = ?';
    const queryDelete = 'DELETE FROM tiket_konser WHERE id_tiket = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id_tiket, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.id_tiket, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
