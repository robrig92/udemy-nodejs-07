process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB = process.env.MONGO_URI;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
}

process.env.JWT_EXP = '1200h';
process.env.SEED = process.env.SEED || 'secret-de-desarrollo';

process.env.URL_DB = urlDB;

process.env.CLIENT_ID = process.env.CLIENT_ID || '966447409801-56kkeb43t5sd5vj2rjladu8sqgddfmad.apps.googleusercontent.com';