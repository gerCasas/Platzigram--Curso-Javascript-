// require metodo va a buscar express en el folder node_modules
var express = require('express');

var app = express();

// para indicar a node que nuestra aplicacion utilizara el motor de vista Pug
app.set('view engine', 'pug');

// para indicar que la carpeta public sera accesible de forma estatica, esto quiere decir que todos los archivos dentro de la carpeta publica se pueden mandar llamar sin anteponer el "/public/" antes del recurso.
app.use(express.static('public'));

app.get('/', function (req, res) {
  // res.send('Hola mundo!');
  res.render('index');
})

app.listen(3000, function(err) {
  if (err) return console.log('Hubo un error'), process.exit(1);
  console.log('Platzigram escuchando en el puerto 3000');
})
