const statesArray = require('../model/statesData.json');

const verifyState = () => {
    return (req, res, next) => {
        if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
        // await State.findOne({ _state: req.params.state }).exec();
        const stateCode = req.params.state.toUpperCase();
        const stateCodes = statesArray.map(st => st.code);
        const isState = stateCodes.find(code => code === stateCode);
        if (!isState) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
        req.code = stateCode;
        next();
    }
}

module.exports = verifyState;