exports.handler = async (event) => {

 const data = JSON.parse(event.body);

 console.log("SHOT:",data);

 return {
  statusCode:200,
  body: JSON.stringify({ok:true})
 };
};