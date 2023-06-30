const router = require("express").Router()

const { ADMIN, NORMAL_USER } = require("../configs/roles")
const { userController: controller } = require("../controllers")
const { userValidation: validation } = require("../validation")
const {
    validate,
    upload: { uploadImage },
    auth,
} = require("../middlewares")

router
    .route("/")
    .get(controller.getUsers)
    .post(
        auth({ requireRole: [ADMIN] }),
        validate(validation.createAUser),
        controller.createUser,
    )

router
    .route("/:userId")
    .get(
        auth({ requireRole: [ADMIN] }),
        validate(validation.getUserById),
        controller.getUserById,
    )
    .patch(
        auth({ requireRole: [ADMIN] }),
        validate(validation.updateUser),
        controller.updateUser,
    )

module.exports = router
