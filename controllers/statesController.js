const State = require('../model/State');
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
};

//combine the states at the json
async function setFacts(){
    for (const state in data.states){ 
        const fact = await State.findOne({statecode: data.states[state].code}).exec(); 
        if (fact){
            
            data.states[state].funfacts = fact.funfacts; // add the fun facts to the json
        }
    }
}

//we have to run the function to join json with mongodb
setFacts();

// Get all states
const getAllStates = async (req,res)=> {
    // check to make see there is a query
    if (req.query){
        if(req.query.contig == 'true')
        {
            //remove AK and HI 
            const result = data.states.filter(st => st.code != "AK" && st.code != "HI");
            res.json(result);
            return;
        }
       // if not continue
        else if (req.query.contig == 'false')
         {
            const result = data.states.filter( st => st.code == "AK" || st.code == "HI");     
            res.json(result);
            return;
         }
    }

   res.json(data.states);
}

// get one state
const getState = (req,res)=> {
    const code = req.params.state;
    // do a search on the state param
    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){
        return res.status(404).json({'message': 'Invalid state'});
    }
    res.json(state);
 }

 //get capital of the state
 const getCapital = (req,res)=> {
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){// check state param
        return res.status(404).json({'message': 'Invalid state'});
    }
    res.json({"state": state.state, "capital": state.capital_city}); 
 }

 // get state and nickname
 const getNickname = (req,res)=> {
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase());
    //check for state
    if(!state){ 
        return res.status(404).json({'message': 'Invalid state'});
    }
    res.json({"state": state.state, "nickname": state.nickname});
 }

 // get population
 const getPopulation = (req,res)=> {
    const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase()); 
    // check state
    if(!state){
        return res.status(404).json({'message': 'Invalid state'});
    }
    res.json({"state": state.state, "population": state.population.toLocaleString("en-US")});
 }
 
 // get admission date
 const getAdmission = (req,res)=> {
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase()); 
    // check state param
    if(!state){
        return res.status(404).json({'message': 'Invalid state'});
    }
    res.json({"state": state.state, "admitted": state.admission_date});
 }

 // get a random fun fact
 const getFunFact = (req,res)=>{
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){
        return res.status(404).json({'message': 'Invalid state'});
    }
    if(state.funfacts){ // if the state has fun facts
    
         res.status(201).json({"funfact": state.funfacts[Math.floor((Math.random()*state.funfacts.length))]});
    } 
    else
    {
        //if there is no fun fact
        res.status(201).json({"message": `No Fun Facts found for ${state.state}`});
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
        return res.status(400).json({'message': 'Invalid state'});
    }
    if(!req?.body?.index) // check for index
    {
        return res.status(400).json({'message': 'State fun fact index value required'});
    }
    if(!req?.body?.funfact){// check for fun fact

        return res.status(400).json({'message': 'fun fact required'});
    }
   
     // get the state code and set it to upper
     const code = req.params.state.toUpperCase();

    const state = await State.findOne({statecode: code}).exec();
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
    const code = req.params.state;

    const state = await State.findOne({statecode: code}).exec(); //find the state
    const jstate = data.states.find( st => st.code == code.toUpperCase());

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

 module.exports={
    getAllStates,
    getState,
    getNickname,
    getPopulation,
    getCapital,
    getAdmission,
    getFunFact,
    createFunFact,
    updateFunFact,
    deleteFunFact
};