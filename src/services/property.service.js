const createError = require("http-errors")

const { Property } = require("../models")
const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
    accommodationTypes: { ONE_ROOM, MULTI_ROOMS },
} = require("../constants")

const createProperty = async (body) => {
    const property = new Property(body)
    await property.save()
    return property
}

const addAccommodations = async (propertyId, ownerId, accomGroupId, newAccoms) => {
    if (newAccoms.length === 0) {
        throw new Error("newAccoms must have at least one accommodation")
    }
    const property = await Property.findOne({ _id: propertyId, owner: ownerId })
    if (!property) {
        throw createError.NotFound("Property not found")
    }
    const accoGroup = property.accommodationGroups.id(accomGroupId)
    if (!accoGroup) {
        throw createError.NotFound("Accommodation group not found")
    }
    accoGroup.accommodations.push(...newAccoms)
    await property.save()
    return property
}

module.exports = {
    createProperty,
    addAccommodations,
}
