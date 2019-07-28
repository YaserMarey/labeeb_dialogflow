// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

let sentiment_msgs = {
goodgood:['Good good 😃, ', 'Great 😃, ', 'Very good 😃, '], 
good:['Alright 😐, ', 'Ok 😐, ', 'Yes 😐, '], 
badbad:['Oh, sorry to hear that 😔, ', 'That is unfortunate 😔, '], 
bad:['Hmmm 🤔, ', 'Ok 🤔, ']};

let getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

   function difficultyFunctionHandler(agent) {
     let difficulty_score = 0.0;
     try{
     	difficulty_score = parseFloat(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
     }
     catch(e){
     //agent.add('error one');
     }
       
     //try{
     if (difficulty_score > 0.3)
          agent.add(sentiment_msgs.goodgood[getRandomInt(0,sentiment_msgs.goodgood.length-1)] + 
                    ' alright how do you describe the assignments of this course?');
        else if (difficulty_score >= 0.1)
          agent.add(sentiment_msgs.good[getRandomInt(0,sentiment_msgs.good.length-1)] + 
                    ' alright how do you describe the assignments of this course?');
        else if (difficulty_score < -0.3)
          agent.add(sentiment_msgs.badbad[getRandomInt(0,sentiment_msgs.badbad.length-1)] +  
                    ' alright how do you describe the assignments of this course?');
        else if (difficulty_score <= -0.1)
          agent.add(sentiment_msgs.bad[getRandomInt(0,sentiment_msgs.bad.length-1)] +  
                    ' alright how do you describe the assignments of this course?');
     agent.setContext({ name: 'sentiment_scores', lifespan: 20, parameters: { difficulty_score: difficulty_score }});
     //}
     //catch(e){
     //	agent.add('error two');
     //}
     
   }

   function assignmentsFunctionHandler(agent) {
     let assignments_score = 0.0;
     try{
     	assignments_score = parseFloat(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
     }
     catch(e){}
     
     if (assignments_score > 0.3)
          agent.add(sentiment_msgs.goodgood[getRandomInt(0,sentiment_msgs.goodgood.length-1)] + 
                    ' how do you describe the course TA\'s and Professors?');
       	   //agent.add('> 0.3');
        else if (assignments_score >= 0.1)
          agent.add(sentiment_msgs.good[getRandomInt(0,sentiment_msgs.good.length-1)] + 
                    ' how do you describe the course TA\'s and Professors?');
          //agent.add('>= 0.1');
        else if (assignments_score < -0.3)
          agent.add(sentiment_msgs.badbad[getRandomInt(0,sentiment_msgs.badbad.length-1)] +  
                    ' how do you describe the course TA\'s and Professors?');
          //agent.add('< -0.3');
        else if (assignments_score <= -0.1)
          agent.add(sentiment_msgs.bad[getRandomInt(0,sentiment_msgs.bad.length-1)] +  
                    ' how do you describe the course TA\'s and Professors?');
          //agent.add('<= -0.1');
     agent.setContext({ name: 'sentiment_scores', lifespan: 20, parameters: { assignments_score: assignments_score }});
   }

  function mentorsFunctionHandler(agent) {
     let mentors_score = 0.0;
    try{
     	mentors_score = parseFloat(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
    }
    catch(e){}
    
     if (mentors_score > 0.3)
          agent.add(sentiment_msgs.goodgood[getRandomInt(0,sentiment_msgs.goodgood.length-1)] + 
                    ' Alright, and how do you describe the lectures?');
        else if (mentors_score >= 0.1)
          agent.add(sentiment_msgs.good[getRandomInt(0,sentiment_msgs.good.length-1)] + 
                    ' Alright, and how do you describe the lectures?');
        else if (mentors_score < -0.3)
          agent.add(sentiment_msgs.badbad[getRandomInt(0,sentiment_msgs.badbad.length-1)] +  
                    ' Alright, and how do you describe the lectures?');
        else if (mentors_score <= -0.1)
          agent.add(sentiment_msgs.bad[getRandomInt(0,sentiment_msgs.bad.length-1)] +  
                    ' Alright, and how do you describe the lectures?');
     agent.setContext({ name: 'sentiment_scores', lifespan: 20, parameters: { mentors_score: mentors_score }});
   }

 function lecturesFunctionHandler(agent) {
   	 let lectures_score = 0.0;
	 try{
     	 lectures_score = parseFloat(request.body.queryResult.sentimentAnalysisResult.queryTextSentiment.score);
     }
   	 catch(e){}
   
  	 let avg_score = (agent.getContext('sentiment_scores').parameters.difficulty_score +
     agent.getContext('sentiment_scores').parameters.assignments_score +
   	 agent.getContext('sentiment_scores').parameters.mentors_score + 
     lectures_score)/4.0;
   
     let msg = ', ok this is the last question, I promise 😃, so on a scale form 1 to 5 where 1 is the worst, and 5 is the best, how do you rate this course';
     
     if (avg_score > 0.3)
          agent.add('It seems that you like this course very much' + msg);
        else if (avg_score >= 0.1)
          agent.add('It seems that you like this course' + msg);
        else if (avg_score < -0.3)
          agent.add('It seems that you don\'t like this course at all' + msg);
        else if (avg_score <= -0.1)
          agent.add('It seems that you don\'t like this course' +  msg);
   		else
          agent.add('It seems that you have some likes and dislikes about this course' +  msg);
   }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('difficulty', difficultyFunctionHandler);
  intentMap.set('assignments', assignmentsFunctionHandler);
  intentMap.set('mentors', mentorsFunctionHandler);
  intentMap.set('lectures', lecturesFunctionHandler);
  //intentMap.set('', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
