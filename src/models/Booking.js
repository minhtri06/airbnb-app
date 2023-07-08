const mongoose = require("mongoose")
const moment = require("moment")

const { createMongooseValidationErr } = require("../utils")
const { toJSON } = require("./plugins")
const Property = require("./Property")

const { Schema } = mongoose

const bookingSchema = new Schema(
    {
        bookIn: { type: Date, required: true },
        bookOut: { type: Date, required: true },
        guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
        propertyOwner: { type: Schema.Types.ObjectId, ref: "User" },
        accomGroupId: { type: Schema.Types.ObjectId, required: true },
        accomId: { type: Schema.Types.ObjectId, required: true },
        status: {
            type: String,
            required: true,
            enum: ["canceled", "booked"],
            default: "booked",
        },
        pricePerNight: { type: Number, min: 0 },
        numberOfDays: { type: Number, min: 0 },
        totalPrice: { type: Number, min: 0 },
    },
    { timestamps: true },
)

bookingSchema.plugin(toJSON)

bookingSchema.pre("save", async function (next) {
    const booking = this

    if (
        booking.isModified("property") ||
        booking.isModified("accomGroupId") ||
        booking.isModified("accomId")
    ) {
        if (!booking.isNew) {
            throw createMongooseValidationErr(
                "property, accomGroupId, accomId",
                "Cannot update property, accomGroupId or accomId",
            )
        }

        const property = await Property.findOne({
            _id: booking.property,
            "accommodationGroups._id": booking.accomGroupId,
            "accommodationGroups.accommodations._id": booking.accomId,
        })
        if (!property) {
            throw createMongooseValidationErr(
                "property, accomGroupId, accomId",
                "Property not found",
            )
        }

        booking.set("propertyOwner", property.owner)

        const accomGroup = property.accommodationGroups.id(booking.accomGroupId)
        booking.set("pricePerNight", accomGroup.pricePerNight)
    }

    if (
        (booking.isModified("bookIn") || booking.isModified("bookOut")) &&
        (await Booking.findOne({
            accomId: booking.accomId,
            bookOut: { $gte: booking.bookIn },
            bookIn: { $lte: booking.bookOut },
        }))
    ) {
        throw createMongooseValidationErr(
            "bookIn, bookOut",
            `Already have another booking between ${booking.bookIn} - ${booking.bookOut}`,
        )
    }

    if (booking.bookIn > booking.bookOut) {
        throw createMongooseValidationErr(
            "bookIn, bookOut",
            "Book in date must be before book out date",
        )
    }
    booking.set("numberOfDays", moment(booking.bookOut).diff(booking.bookIn, "days"))
    booking.set("totalPrice", booking.numberOfDays * booking.pricePerNight)

    next()
})

bookingSchema.index({ accomId: 1, bookIn: 1, bookOut: 1 })

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking
