const express = require("express");
const router = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");

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

		const html = `Hi there
		<br/> This is your token to verify the email address
		<br/>
		Token: <b>${token}</b>
		<br/>
		On the following page:
		<a href="http://localhost:3000/student/verify">http://localhost:3000/student/verify</a>
		<br/> <br/>
		`;

		await mailer.sendEmail("admin@mnnit.ac.in", email, "Please verify your email", html);


		req.flash("success", "please check your email");
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
});

router.post("/student/verify", async (req, res) => {
	try{const { token } = req.body;
	const student = await Student.findOne({ "token": token });
	if (!student) {
		req.flash("error", "wrong token");
		res.redirect("/");
	}
	student.isVerified = true;
	student.token = "";
	await student.save();
	req.flash("success", "successsfully verified");
		res.redirect("/");
	}
	catch (err) {
		console.log(err);
	}
})

module.exports = router;