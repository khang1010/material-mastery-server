'use strict';

const { default: mongoose } = require("mongoose");

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => {
        return [item, 1];
    }))
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map((item) => {
        return [item, 0];
    }))
}

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined || obj[key] === null) delete obj[key];
    })

    return obj;
}

const updateNestedObject = obj => {
    const final = {}
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object') {
            const response = updateNestedObject(obj[key]);
            Object.keys(response).forEach((a) => {
                final[`${key}.${a}`] = response[a];
            })
        } else {
            final[key] = obj[key];
        }
    })
    return final
}

const convertToObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
}

module.exports = {
    getSelectData,
    getUnSelectData,
    removeUndefinedObject,
    updateNestedObject,
    convertToObjectId,
}