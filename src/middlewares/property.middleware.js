const { propertyService: service } = require("../services")
const createError = require("http-errors")
const { ADMIN } = require("../configs/roles")

/** @return {import('express').RequestHandler} */
const getPropertyById = async (req, res, next) => {
    req.property = await service.getProperty({ propertyId: req.params.propertyId })
    next()
}

/** @return {import('express').RequestHandler} */
const getPropertyByPageName = async (req, res, next) => {
    req.property = await service.getProperty({
        pageName: req.params.pageName,
    })
    return next()
}

/**
 * Must call after getPropertyById middleware
 * @return {import('express').RequestHandler} */
const getAccomGroupById = async (req, res, next) => {
    const accomGroup = await service.getAccomGroupById(
        req.property,
        req.params.accomGroupId,
    )
    req.accomGroup = accomGroup
    return next()
}

/**
 * Must call after auth and getPropertyById middleware
 * @return {import('express').RequestHandler}*/
const requireToOwnProperty = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (allowAdmin && req.user.roles.includes(ADMIN)) {
            return next()
        }
        if (!req.property.owner.equals(req.user._id)) {
            throw createError.Forbidden("Forbidden")
        }
        req.property.caller.isOwner = true
        return next()
    }
}

module.exports = {
    getPropertyById,
    getPropertyByPageName,
    getAccomGroupById,
    requireToOwnProperty,
}