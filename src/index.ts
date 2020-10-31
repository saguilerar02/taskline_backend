import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import connection from './database/MongoConnection';
import { createTransporter } from './services/Mailer';
import { job } from './services/MailerNotifierServiceImpl';

const result = dotenv.config({path:".env"});

if(!result.error){

    try {
        
        http.createServer(app).listen(3000);
        console.log(`Listening on http://localhost:${app.get('port')}`);
        connection();
        createTransporter();
        job.start();
    } catch (error) {
        console.error('Algo salio mal, ERROR conectando con la base de datos')
        job.stop()
    }
    
}else{
    console.error('Algo salio mal, ERROR cargando variables de entorno')
    
}





