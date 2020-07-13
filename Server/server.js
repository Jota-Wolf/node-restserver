//Al ser config.js el primer archivo va configurar el servidor
require('./config/config');
const express = require('express');
const app = express();
//Este paquete body-parser que permite procesar la informacion que viene de un post o put
// y la serializa en on objeto JSON
var bodyParser = require('body-parser')
//Estos con middleware , cada vez que se ocupa el app.use se ocupan los middleware
//cada vez que se realiza una peticion se activa el middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

app.get('/usuarios', (req, res) => {
	res.json('get Usuario');
});

app.post('/usuarios', (req, res) => {

	let body = req.body;

	if (body.nombre === undefined) {
		res.status(400).json({
			ok: false,
			mensaje: 'El nombre es necesario'
		})
	} else {
		res.json({
			usuario: body
		});
	}

});

app.put('/usuarios/:id', (req, res) => {
	let id_user = req.params.id;
	res.json({
		id_user
	});
});

app.delete('/usuarios', (req, res) => {
	res.json('delete Usuario');
});

//Uso el puerto que esta en config.js
app.listen(process.env.PORT, () => {
	console.log('Servidor en puerto:', process.env.PORT);
});