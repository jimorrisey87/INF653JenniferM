const State = require('../model/States');
//get all fun facts

//get all States from json
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
};

//combine the states at the json
async function setFacts(){
    for (const state in data.states){ 
        const fact = await State.findOne({statecode: data.states[state].code}).exec(); // compare each state
        if (fact){
            
            data.states[state].funfacts = fact.funfacts; // add the fun facts to the json
        }
    }
}

// run set facts to merge the json with the mongodb
setFacts();

// Get all states
const getAllStates = async (req,res)=> {
    // check to make see there is a query
    if (req.query){
        if(req.query.contig == 'true')   // if there is remove two states
        {
            const result = data.states.filter(st => st.code != "AK" && st.code != "HI");
            res.json(result);
            return;
        }
       // if not contig
        else if (req.query.contig == 'false') // not not displa the two states
         {
            const result = data.states.filter( st => st.code == "AK" || st.code == "HI");     
            res.json(result);
            return;
         }
    }

   res.json(data.states); // otherwise return all states
}

// get one state
const getState = (req,res)=> {
    // get the state code and set it to upper
    const code = req.params.state.toUpperCase();
    // do a search on the state param
    const state = data.states.find( st => st.code == code);
    if(!state){ // if it doesnt exist message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json(state);
 }

 //get state and capital
 const getCapital = (req,res)=> {
     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = data.states.find( st => st.code == code);
    if(!state){// check state param
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({"state": state.state, "capital": state.capital_city}); // if state send capital
 }

 // get state and nickname
 const getNickname = (req,res)=> {
     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = data.states.find( st => st.code == code); //check for state param
    if(!state){ 
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({"state": state.state, "nickname": state.nickname}); // if state send nick
 }

 // get state and population
 const getPopulation = (req,res)=> {
     // get the state code and set it to upper
    const code = req.params.state.toUpperCase();

    const state = data.states.find( st => st.code == code); // check state param
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({"state": state.state, "population": state.population.toLocaleString("en-US")}); // if state send population
 }
 
 // get state and date of admittance
 const getAdmission = (req,res)=> {

     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = data.states.find( st => st.code == code); // check state param
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({"state": state.state, "admitted": state.admission_date}); // if state send date of admittance
 }

 // get a random fun fact
 const getFunFact = (req,res)=>{
     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = data.states.find( st => st.code == code);
    if(!state){ // if it doesnt exist message
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(state.funfacts){ // if the state has fun facts
    
         res.status(201).json({"funfact": state.funfacts[Math.floor((Math.random()*state.funfacts.length))]}); // grab a random one
    } 
    else
    {
        res.status(201).json({"message": `No Fun Facts found for ${state.state}`}); // if not send a message
    }
}

// create fun facgts
const createFunFact = async (req,res)=>{
    if (!req?.params?.state){ // check for state
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(!req?.body?.funfacts){

        return res.status(400).json({"message": "State fun facts value required"});
    }
    if(!Array.isArray(req.body.funfacts)) { // check for array
        return res.status(400).json({'message': "State fun facts value must be an array"});
    }

     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    try {
        // if the funfact cannot be added to an existing group create a new one 
       if(!await State.findOneAndUpdate({statecode: code},{$push: {"funfacts": req.body.funfacts}})){   
            await State.create({ 
                statecode: code,
                funfacts: req.body.funfacts
             });
        } // grab the result of the operation
        const result = await State.findOne({statecode: code}).exec();
     

        res.status(201).json(result); // send it out
    } catch (err) {console.error(err);}   
    
    setFacts(); // rebuild the json
}

const updateFunFact = async (req,res)=>{
    if(!req?.params?.state){ // check for state
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(!req?.body?.index) // check for index
    {
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    if(!req?.body?.funfact){// check for fun fact

        return res.status(400).json({"message": "State fun fact value required"});
    }
   
     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = await State.findOne({statecode: code}).exec(); // find the state
    const jstate = data.states.find( st => st.code == code);

    let index = req.body.index; // record the index

    if (!jstate.funfacts || index-1 == 0)
    {
        return res.status(400).json({"message": `No Fun Facts found for ${jstate.state}`});
    }
    
    if(index > state.funfacts.length || index < 1 || !index){ // see if that index exists
        const state = data.states.find( st => st.code == code);
        return res.status(400).json({"message": `No Fun Fact found at that index for ${jstate.state}`});
    }
    index -= 1; // reduce the index to meet the correct spot

    if (req.body.funfact) state.funfacts[index] = req.body.funfact; //if a funfact exists copy the new one over
    
    const result = await state.save(); // save the result

    res.status(201).json(result);

    setFacts(); // rebuild the json
}   

const deleteFunFact = async(req,res)=>{
    
    if(!req.params.state){ // check for state
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    if(!req.body.index) // check for index
    {
        return res.status(400).json({"message": "State fun fact index value required"});
    }

     // get the state code and set it to upper
    const code = req.params.state.toUpperCase();

    const state = await State.findOne({statecode: code}).exec(); //find the state
    const jstate = data.states.find( st => st.code == code);

    let index = req.body.index; // record the index

    if (!jstate.funfacts || index-1 == 0)
    {
        return res.status(400).json({"message": `No Fun Facts found for ${jstate.state}`});
    }
    
    if(index > state.funfacts.length || index < 1 || !index){ // see if that index exists
        const state = data.states.find( st => st.code == code);
        return res.status(400).json({"message": `No Fun Fact found at that index for ${jstate.state}`});
    }
    index -= 1; // reduce the index to meet the correct spot

    state.funfacts.splice(index, 1); // if it does slice off the fact
    
    const result = await state.save(); // save the result

    res.status(201).json(result);

    setFacts(); // rebuild the json
}

 module.exports={getAllStates, getState, getNickname, getPopulation, getCapital, getAdmission, getFunFact, createFunFact, updateFunFact,deleteFunFact};