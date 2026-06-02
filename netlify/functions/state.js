let gameState = {
 enemy:{x:0,z:-30,hp:100}
};

exports.handler = async (event) => {

 if(event.httpMethod==="POST"){
  const body = JSON.parse(event.body);

  gameState.player = body;
 }

 return {
  statusCode:200,
  body: JSON.stringify(gameState)
 };
};