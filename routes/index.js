const express = require("express");
const router = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");

router.post("/student/register", async (req, res) => {
	try {
		const { name, email, password, dob, reg, branch } = req.body;

		const hashPassword = await bcrypt.hash(password, 10);

		const token = randomstring.generate();

		const student = new Student({
			name,
			email,
			password: hashPassword,
			dob,
			reg,
			branch
		});
		await student.save();
		req.flash("success", "you may now log in");
		res.redirect("/");
	} catch (err) {
		console.log(err);
		res.send({ status: "error", err });
	}
});

router.post("/student/login", passport.authenticate('local', {
	successRedirect: "/",
	failureRedirect: "/",
	failureFlash: true
}));

router.get("/student/logout", (req, res) => {
	req.logOut();
	req.flash("success", "successsfully logout");
	res.render("/");
})

module.exports = router;