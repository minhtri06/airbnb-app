const { User } = require("../models")
const { redisClient } = require("../db")
const { DEFAULT_EXPIRATION } = require("../configs/envConfig").redis

const getUser = async (userId) => {
    return JSON.parse(await redisClient.get(`user:${userId}`))
}

const cacheUser = async (user) => {
    await redisClient.setEx(`user:${user._id}`, DEFAULT_EXPIRATION, JSON.stringify(user))
}

const getOrCacheGetUser = async (userId) => {
    let user = await getUser(userId)
    if (user === null) {
        user = await User.findById(userId)
            .populate("address.province")
            .populate("address.district")
        if (user === null) {
            return null
        }
        cacheUser(user)
    }
    return user
}

module.exports = {
    getUser,
    cacheUser,
    getOrCacheGetUser,
}
