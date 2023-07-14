const createError = require("http-errors")
const { meService: service, bookingService, propertyService } = require("../services")

/** @type {import('express').RequestHandler} */
const getMyProfile = async (req, res) => {
    return res.json({ myProfile: req.user })
}

/** @type {import('express').RequestHandler} */
const updateMyProfile = async (req, res) => {
    const myProfile = await service.updateMyProfile(req.user, req.body)
    return res.json({ myProfile })
}

/** @type {import('express').RequestHandler} */
const replaceMyAvatar = async (req, res) => {
    const avatar = await service.replaceMyAvatar(req.user, req.file)
    return res.json({ avatar })
}

/** @type {import('express').RequestHandler} */
const getMyProperties = async (req, res) => {
    req.query.select = "-images -description -facilities -owner -accommodationGroups"
    const properties = await propertyService.paginateProperties(
        { owner: req.user._id },
        req.query,
    )
    return res.json({ properties })
}

/** @type {import('express').RequestHandler} */
const getMyBookings = async (req, res) => {
    req.query.populate = [
        { path: "property", select: "thumbnail title pageName address score" },
    ]
    const bookings = await bookingService.paginateBookings(
        { guest: req.user._id },
        req.query,
    )
    return res.json({ bookings })
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    replaceMyAvatar,
    getMyProperties,
    getMyBookings,
}
