const express = require("express");
const Enrollment = require("../models/Enrollment");

const router = express.Router();

/**
 * @swagger
 * /api/enroll:
 *   post:
 *     summary: Create course enrollment
 *     description: Enroll a user in a course
 *     tags: [Enrollment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               courseId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               enrollmentDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, completed, dropped]
 *                 default: active
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 enrollment:
 *                   $ref: '#/components/schemas/Enrollment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", async (req, res) => {
  const enrollment = await Enrollment.create(req.body);
  res.json(enrollment);
});

module.exports = router;
