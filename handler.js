'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const lambda = new AWS.Lambda({
  region: 'us-east-1'
})

module.exports.created = (event,callback) => {
  event.Records.forEach((record) => {
      console.log(record);
    const filename = record.s3.object.key;
    const date = record.eventTime;
    const event = record.eventName;
    const filesize = record.s3.object.size;
    const params1 = {
        TableName: 'takehometable',
        Item: {
            fileName: filename ,
            eventType:event,
            CreationDate : date,
            fileSize: filesize
            
        }
    }

    dynamodb.put(params1,(error, result) => {
      if(error){
          console.log(error);
      }
      console.log("success");
    });

    
  });
}


module.exports.list = (event,context,callback) =>{

  const params = {
    TableName: 'takehometable',
    };
    
  dynamodb.scan(params, (error,data) =>{
    if (error) {
      console.log(error);
      callback(new Error('songs are not available in the bucket'));
      return;

    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items)
      };
      callback("Success",response);
      })
}

module.exports.playlist = (event, context, callback) =>{

  const data = JSON.parse(event.body);
  const params = {
      TableName: 'playlisttable',
      Item: {
          playlistName: data.playlistname,
          fileName: data.songname
      }
  }
  dynamodb.put(params,(error, result) => {
    if(error){
        console.log(error)
        callback(new Error('Sorry,Song is not added to your playlist'));
        return;
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify({
  message: 'Song is added to your playlist',
})
    }
    callback(null,response);
})
}


module.exports.get = (event,context,callback) =>{

  const params = {
    TableName: 'takehometable',
    Key: {
    fileName: event.pathParameters.name
    }
    };
    
  dynamodb.get(params, (error,data) =>{
    if (error) {
      console.log(error);
      callback(new Error('This song is not available in the song list'));
      return;

    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item)
      };
      callback("Success",response);
      })
}