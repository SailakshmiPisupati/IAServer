/*
* @Author: Saila
* @Date:   2017-10-24 14:31:24
* @Last Modified by:   Saila
* @Last Modified time: 2017-10-24 14:31:35
*/
const Sequelize = require('sequelize');
const sequelize = new Sequelize('iaserver','root','admin',{
	host: 'localhost',
	dialect : 'mysql',

});

sequelize.authenticate().then(() =>{
	console.log('Connection has been established successfully!');
})
.catch(err=>{
	console.error('Unable to connect to the database!');
});


