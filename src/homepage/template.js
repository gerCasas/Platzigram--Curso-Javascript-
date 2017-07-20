var yo = require('yo-yo');
var layout = require('../layout');
var picture = require('../picture-card');

//module.exports para decir que este archivo exporta todo este contenido
module.exports = function (pictures) {
  var el = yo`<div class="container timeline">
    <div class="row">

        ${pictures.map( function (pic) {
          return picture(pic);
        })}
    
    </div>
  </div>`;

  return layout(el);
}
