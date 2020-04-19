process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB = process.env.MONGO_URI;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
}

process.env.JWT_EXP = 60 * 60 * 24 * 30;
process.env.SEED = process.env.SEED || 'secret-de-desarrollo';

process.env.URL_DB = urlDB;