const State = require('../model/State');
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
};

//verify state
const verifyState = async (req,res, next) => {
    const stateCode = req.params.state;
    const isValidState = validateState(stateCode);

    return isValidState ? next () : res.json({message: "Invalid state abbreviation parameter"});
}

//combine the states at the json
async function setStates(){
    for (const state in data.states){ 
        const fact = await State.findOne({
            statecode: data.states[state].code}).exec(); 
        if (fact){
            data.states[state].funfacts = fact.funfacts;
        }
    }
}

//run function to join with mongodb
setStates();

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
    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json(state);
 }

 //get capital of the state
 const getCapital = (req,res)=> {
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){// check state param
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({
        "state": state.state,
        "capital": state.capital_city
    }); 
 }

 // get state nickname
 const getNickname = (req,res)=> {
    const code = req.params.state;
    const state = data.states.find( st => st.code == code.toUpperCase());

    //check for state
    if(!state){ 
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({
        "state": state.state,
        "nickname": state.nickname
    });
 }

 // get population
 const getPopulation = (req,res)=> {
    const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase()); 
    // check state
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({
        "state": state.state,
        "population": state.population.toLocaleString("en-US")
    });
 }
 
 // get admission date
 const getAdmission = (req,res)=> {
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase()); 
    // check state param
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    res.json({
        "state": state.state,
        "admitted": state.admission_date
    });
 }

 // get a random fun fact
 const getFunFact = (req,res)=>{
     const code = req.params.state;

    const state = data.states.find( st => st.code == code.toUpperCase());
    if(!state){
        return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }
    //state has fun fact
    if(state.funfacts){ 
    
         res.status(201).json({"funfact": state.funfacts[Math.floor((Math.random()*state.funfacts.length))]});
    } 
    else
    {
    //if there is no fun fact
        res.status(201).json({"message": `No Fun Facts found for ${state.state}`});
    }
}

const createFunFact = async (req, res) => {
    if (!req?.body?.funfacts) return res.status(400).json({ 'message': 'State fun facts value required' });
    if (!Array.isArray(req.body.funfacts)) return res.json({ 'message': 'State fun facts value must be an array' });
    try {
        await State.updateOne(
            { code: req.code },
            { $push: { funfacts: req.body.funfacts } },
            { upsert: true }
        );
        const stateDB = await State.findOne({ code: req.code }).exec();
        return res.status(201).json(stateDB);
    } catch (err) {
        console.error(err);
    }
}


const updateFunFact = async (req,res)=>{
    //check state code
    if(!req?.params?.state){
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    //check index
    if(!req?.body?.index)
    {
        return res.status(400).json({'message': 'State fun fact index value required'});
    }
    //check fun fact
    if(!req?.body?.funfact){

        return res.status(400).json({'message': 'State fun fact value required'});
    }
   
     // get the state code
     const code = req.params.state;

    const state = await State.findOne({statecode: code}).exec();
    const jstate = data.states.find( st => st.code == code.toUpperCase());

    //record index
    let index = req.body.index;

    if (!jstate.funfacts || index-1 == 0)
    {
        return res.status(400).json({"message": `No Fun Facts found for ${jstate.state}`});
    }
    
    if(index > state.funfacts.length || index < 1 || !index){
        const state = data.states.find( st => st.code == code);
        return res.status(400).json({"message": `No Fun Fact found at that index for ${jstate.state}`});
    }
    index -= 1;

    //funfact exists then copy it over
    if (req.body.funfact) state.funfacts[index] = req.body.funfact;
    
    const result = await state.save();

    res.status(201).json(result);

    //rebuild json
    setStates();
}   

const deleteFunFact = async(req,res)=>{
    
    //check state
    if(!req.params.state){
        return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
    }
    //check index
    if(!req.body.index)
    {
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    //get state code
    const code = req.params.state;

    const state = await State.findOne({statecode: code}).exec();
    const jstate = data.states.find( st => st.code == code.toUpperCase());

    let index = req.body.index;

    if (!jstate.funfacts || index-1 == 0)
    {
        return res.status(400).json({"message": `No Fun Facts found for ${jstate.state}`});
    }
    
    if(index > state.funfacts.length || index < 1 || !index){
        const state = data.states.find( st => st.code == code.toUpperCase());
        return res.status(400).json({"message": `No Fun Fact found at that index for ${jstate.state}`});
    }
    //reduce index
    index -= 1;

    state.funfacts.splice(index, 1);
    
    const result = await state.save();

    res.status(201).json(result);

    //rebuild json
    setStates();
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